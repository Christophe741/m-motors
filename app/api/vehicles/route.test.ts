import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("@/server/database", () => ({
  getVehicles: vi.fn(),
  createVehicle: vi.fn(),
}));
vi.mock("@/lib/jwt", () => ({ getAuthUser: vi.fn() }));

import { GET, POST } from "@/app/api/vehicles/route";
import { getVehicles, createVehicle } from "@/server/database";
import { getAuthUser } from "@/lib/jwt";

// Requête GET : on simule nextUrl.searchParams à partir d'une query string
function getReq(query = ""): NextRequest {
  return { nextUrl: { searchParams: new URLSearchParams(query) } } as NextRequest;
}

// Requête POST : corps JSON
function postReq(body: unknown): NextRequest {
  return { json: async () => body } as unknown as NextRequest;
}

beforeEach(() => vi.clearAllMocks());

describe("GET /api/vehicles", () => {
  it("retourne les véhicules avec le compte", async () => {
    vi.mocked(getVehicles).mockResolvedValue([{ id: "v1" }, { id: "v2" }] as never);
    const res = await GET(getReq());
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.count).toBe(2);
  });

  it("transforme les paramètres de requête en filtres", async () => {
    vi.mocked(getVehicles).mockResolvedValue([] as never);
    await GET(getReq("search=clio&type_offre=vente&prix_min=5000&annee_max=2024"));

    expect(getVehicles).toHaveBeenCalledWith(
      expect.objectContaining({
        search: "clio",
        type_offre: "vente",
        prix_min: 5000,
        annee_max: 2024,
      })
    );
  });

  it("ignore un type_offre invalide", async () => {
    vi.mocked(getVehicles).mockResolvedValue([] as never);
    await GET(getReq("type_offre=nimporte_quoi"));
    expect(getVehicles).toHaveBeenCalledWith(expect.not.objectContaining({ type_offre: "nimporte_quoi" }));
  });

  it("retourne 500 en cas d'erreur", async () => {
    vi.mocked(getVehicles).mockRejectedValue(new Error("boom"));
    const res = await GET(getReq());
    expect(res.status).toBe(500);
  });
});

describe("POST /api/vehicles", () => {
  it("refuse un utilisateur non authentifié (401)", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    const res = await POST(postReq({}));
    expect(res.status).toBe(401);
  });

  it("refuse un utilisateur non admin (401)", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ sub: "u1", role: "client" });
    const res = await POST(postReq({}));
    expect(res.status).toBe(401);
  });

  it("crée le véhicule pour un admin (201)", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ sub: "a1", role: "admin" });
    vi.mocked(createVehicle).mockResolvedValue({ id: "v1" } as never);
    const res = await POST(postReq({ marque: "Audi" }));
    const json = await res.json();
    expect(res.status).toBe(201);
    expect(json.data.id).toBe("v1");
  });

  it("retourne 500 si la création échoue", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ sub: "a1", role: "admin" });
    vi.mocked(createVehicle).mockRejectedValue(new Error("boom"));
    const res = await POST(postReq({}));
    expect(res.status).toBe(500);
  });
});
