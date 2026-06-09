import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("@/server/database", () => ({
  getUserByEmail: vi.fn(),
  verifyPassword: vi.fn(),
}));
vi.mock("@/lib/jwt", () => ({ signToken: vi.fn(async () => "jeton-test") }));

import { POST } from "@/app/api/auth/login/route";
import { getUserByEmail, verifyPassword } from "@/server/database";

function req(body: unknown): NextRequest {
  return {
    method: "POST",
    nextUrl: { pathname: "/api/auth/login" },
    json: async () => body,
  } as unknown as NextRequest;
}

beforeEach(() => vi.clearAllMocks());

describe("POST /api/auth/login", () => {
  it("retourne 400 si email ou mot de passe manquant", async () => {
    const res = await POST(req({ email: "a@b.com" }));
    expect(res.status).toBe(400);
  });

  it("retourne 401 si l'utilisateur n'existe pas", async () => {
    vi.mocked(getUserByEmail).mockResolvedValue(null);
    const res = await POST(req({ email: "a@b.com", password: "x" }));
    expect(res.status).toBe(401);
  });

  it("retourne 401 si le mot de passe est incorrect", async () => {
    vi.mocked(getUserByEmail).mockResolvedValue({ id: "u1", mot_de_passe: "hash" } as never);
    vi.mocked(verifyPassword).mockResolvedValue(false);
    const res = await POST(req({ email: "a@b.com", password: "mauvais" }));
    expect(res.status).toBe(401);
  });

  it("connecte l'utilisateur et pose le cookie si tout est valide", async () => {
    vi.mocked(getUserByEmail).mockResolvedValue({
      id: "u1",
      role: "client",
      email: "a@b.com",
      mot_de_passe: "hash",
    } as never);
    vi.mocked(verifyPassword).mockResolvedValue(true);

    const res = await POST(req({ email: "a@b.com", password: "bon" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.user.mot_de_passe).toBeUndefined();
    expect(res.cookies.get("mmotors_token")?.value).toBe("jeton-test");
  });

  it("retourne 500 en cas d'erreur serveur", async () => {
    vi.mocked(getUserByEmail).mockRejectedValue(new Error("boom"));
    const res = await POST(req({ email: "a@b.com", password: "x" }));
    expect(res.status).toBe(500);
  });
});
