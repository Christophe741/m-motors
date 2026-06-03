import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("@/server/database", () => ({
  getAllDossiers: vi.fn(),
  getDossiersByClientId: vi.fn(),
}));
vi.mock("@/lib/jwt", () => ({ getAuthUser: vi.fn() }));

const prismaMock = vi.hoisted(() => ({ dossier: { create: vi.fn() } }));
vi.mock("@/server/prisma", () => ({ prisma: prismaMock }));

import { GET, POST } from "@/app/api/dossiers/route";
import { getAllDossiers, getDossiersByClientId } from "@/server/database";
import { getAuthUser } from "@/lib/jwt";

function getReq(query = ""): NextRequest {
  return { nextUrl: { searchParams: new URLSearchParams(query) } } as NextRequest;
}
function postReq(body: unknown): NextRequest {
  return { json: async () => body } as unknown as NextRequest;
}

beforeEach(() => vi.clearAllMocks());

describe("GET /api/dossiers", () => {
  it("retourne 401 sans authentification", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    const res = await GET(getReq());
    expect(res.status).toBe(401);
  });

  it("un client ne voit que ses propres dossiers", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ sub: "u1", role: "client" });
    vi.mocked(getDossiersByClientId).mockResolvedValue([{ id: "d1" }] as never);

    const res = await GET(getReq("clientId=autre"));
    const json = await res.json();
    // Le clientId de la query est ignoré pour un client : on force user.sub
    expect(getDossiersByClientId).toHaveBeenCalledWith("u1");
    expect(json.count).toBe(1);
  });

  it("un admin sans clientId récupère tous les dossiers", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ sub: "a1", role: "admin" });
    vi.mocked(getAllDossiers).mockResolvedValue([{ id: "d1" }, { id: "d2" }] as never);

    await GET(getReq());
    expect(getAllDossiers).toHaveBeenCalled();
  });

  it("retourne 500 en cas d'erreur", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ sub: "a1", role: "admin" });
    vi.mocked(getAllDossiers).mockRejectedValue(new Error("boom"));
    const res = await GET(getReq());
    expect(res.status).toBe(500);
  });
});

describe("POST /api/dossiers", () => {
  it("retourne 401 sans authentification", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    const res = await POST(postReq({}));
    expect(res.status).toBe(401);
  });

  it("retourne 400 si données manquantes", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ sub: "u1", role: "client" });
    const res = await POST(postReq({ vehicule_id: "v1" })); // type_dossier manquant
    expect(res.status).toBe(400);
  });

  it("crée le dossier avec les documents et le contrat", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ sub: "u1", role: "client" });
    prismaMock.dossier.create.mockResolvedValue({ id: "d1" });

    const res = await POST(
      postReq({
        vehicule_id: "v1",
        type_dossier: "achat",
        documents: [{ type_document: "identite", fichier_nom: "id.pdf", fichier_type: "pdf" }],
        contrat_location: { duree_mois: 24 },
      })
    );
    const json = await res.json();

    expect(json.success).toBe(true);
    // Le dossier est rattaché au client connecté
    expect(prismaMock.dossier.create.mock.calls[0][0].data.client_id).toBe("u1");
  });

  it("retourne 500 en cas d'erreur", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ sub: "u1", role: "client" });
    prismaMock.dossier.create.mockRejectedValue(new Error("boom"));
    const res = await POST(
      postReq({ vehicule_id: "v1", type_dossier: "achat", documents: [] })
    );
    expect(res.status).toBe(500);
  });
});
