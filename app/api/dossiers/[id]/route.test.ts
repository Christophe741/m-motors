import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("@/server/database", () => ({ getDossierById: vi.fn() }));
vi.mock("@/lib/jwt", () => ({ getAuthUser: vi.fn() }));

const prismaMock = vi.hoisted(() => ({
  document: { findUnique: vi.fn(), update: vi.fn() },
  dossier: { findUnique: vi.fn(), update: vi.fn() },
}));
vi.mock("@/server/prisma", () => ({ prisma: prismaMock }));

import { GET, PATCH } from "@/app/api/dossiers/[id]/route";
import { getDossierById } from "@/server/database";
import { getAuthUser } from "@/lib/jwt";

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
function req(body?: unknown): NextRequest {
  return {
    method: "PATCH",
    nextUrl: { pathname: "/api/dossiers/d1" },
    json: async () => body,
  } as unknown as NextRequest;
}

beforeEach(() => vi.clearAllMocks());

describe("GET /api/dossiers/[id]", () => {
  it("retourne 401 sans authentification", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    const res = await GET(req(), ctx("d1"));
    expect(res.status).toBe(401);
  });

  it("retourne 404 si le dossier n'existe pas", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ sub: "u1", role: "client" });
    vi.mocked(getDossierById).mockResolvedValue(null);
    const res = await GET(req(), ctx("d1"));
    expect(res.status).toBe(404);
  });

  it("retourne 403 si un client accède au dossier d'un autre", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ sub: "u1", role: "client" });
    vi.mocked(getDossierById).mockResolvedValue({ id: "d1", client_id: "autre" } as never);
    const res = await GET(req(), ctx("d1"));
    expect(res.status).toBe(403);
  });

  it("retourne le dossier au propriétaire", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ sub: "u1", role: "client" });
    vi.mocked(getDossierById).mockResolvedValue({ id: "d1", client_id: "u1" } as never);
    const res = await GET(req(), ctx("d1"));
    expect((await res.json()).success).toBe(true);
  });

  it("retourne 500 en cas d'erreur", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ sub: "u1", role: "client" });
    vi.mocked(getDossierById).mockRejectedValue(new Error("boom"));
    const res = await GET(req(), ctx("d1"));
    expect(res.status).toBe(500);
  });
});

describe("PATCH /api/dossiers/[id]", () => {
  it("retourne 401 pour un non-admin", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ sub: "u1", role: "client" });
    const res = await PATCH(req({}), ctx("d1"));
    expect(res.status).toBe(401);
  });

  it("met à jour le statut d'un dossier (admin)", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ sub: "a1", role: "admin" });
    prismaMock.dossier.update.mockResolvedValue({ id: "d1", statut: "valide" });
    const res = await PATCH(req({ statut: "valide" }), ctx("d1"));
    expect((await res.json()).success).toBe(true);
    expect(prismaMock.dossier.update).toHaveBeenCalled();
  });

  it("met à jour un document existant", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ sub: "a1", role: "admin" });
    prismaMock.document.findUnique.mockResolvedValue({ id: "doc1", dossier_id: "d1" });
    prismaMock.document.update.mockResolvedValue({});
    prismaMock.dossier.findUnique.mockResolvedValue({ id: "d1" });

    const res = await PATCH(
      req({ action: "update_document", documentId: "doc1", statut: "valide" }),
      ctx("d1")
    );
    expect((await res.json()).success).toBe(true);
    expect(prismaMock.document.update).toHaveBeenCalled();
  });

  it("retourne 404 si le document n'appartient pas au dossier", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ sub: "a1", role: "admin" });
    prismaMock.document.findUnique.mockResolvedValue({ id: "doc1", dossier_id: "AUTRE" });
    const res = await PATCH(
      req({ action: "update_document", documentId: "doc1" }),
      ctx("d1")
    );
    expect(res.status).toBe(404);
  });

  it("retourne 500 en cas d'erreur", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({ sub: "a1", role: "admin" });
    prismaMock.dossier.update.mockRejectedValue(new Error("boom"));
    const res = await PATCH(req({ statut: "valide" }), ctx("d1"));
    expect(res.status).toBe(500);
  });
});
