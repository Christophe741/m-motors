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
  return {
    method: "GET",
    nextUrl: { pathname: "/api/vehicles", searchParams: new URLSearchParams(query) },
  } as NextRequest;
}

// Requête POST : corps JSON
function postReq(body: unknown): NextRequest {
  return {
    method: "POST",
    nextUrl: { pathname: "/api/vehicles" },
    json: async () => body,
  } as unknown as NextRequest;
}

beforeEach(() => vi.clearAllMocks());

// Réponse paginée de getVehicles
function vehiclesPage(vehicles: unknown[], total = vehicles.length) {
  return { vehicles, total } as never;
}

describe("GET /api/vehicles", () => {
  it("retourne les véhicules avec le compte et la pagination", async () => {
    vi.mocked(getVehicles).mockResolvedValue(
      vehiclesPage([{ id: "v1" }, { id: "v2" }], 30)
    );
    const res = await GET(getReq());
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.count).toBe(2);
    expect(json.pagination).toEqual({
      page: 1,
      limit: 12,
      total: 30,
      totalPages: 3,
    });
  });

  it("transforme les paramètres de requête en filtres", async () => {
    vi.mocked(getVehicles).mockResolvedValue(vehiclesPage([]));
    await GET(getReq("search=clio&type_offre=vente&prix_min=5000&annee_max=2024&statut=disponible"));

    expect(getVehicles).toHaveBeenCalledWith(
      expect.objectContaining({
        search: "clio",
        type_offre: "vente",
        prix_min: 5000,
        annee_max: 2024,
        statut: "disponible",
      }),
      { page: 1, limit: 12 }
    );
  });

  it("transmet page et limit à la couche données", async () => {
    vi.mocked(getVehicles).mockResolvedValue(vehiclesPage([]));
    await GET(getReq("page=3&limit=24"));
    expect(getVehicles).toHaveBeenCalledWith(expect.anything(), { page: 3, limit: 24 });
  });

  it("plafonne limit et ignore une page invalide", async () => {
    vi.mocked(getVehicles).mockResolvedValue(vehiclesPage([]));
    await GET(getReq("page=abc&limit=9999"));
    expect(getVehicles).toHaveBeenCalledWith(expect.anything(), { page: 1, limit: 100 });
  });

  it("ignore un type_offre invalide", async () => {
    vi.mocked(getVehicles).mockResolvedValue(vehiclesPage([]));
    await GET(getReq("type_offre=nimporte_quoi"));
    expect(getVehicles).toHaveBeenCalledWith(
      expect.not.objectContaining({ type_offre: "nimporte_quoi" }),
      expect.anything()
    );
  });

  it("ignore un statut invalide", async () => {
    vi.mocked(getVehicles).mockResolvedValue(vehiclesPage([]));
    await GET(getReq("statut=nimporte_quoi"));
    expect(getVehicles).toHaveBeenCalledWith(
      expect.not.objectContaining({ statut: "nimporte_quoi" }),
      expect.anything()
    );
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
