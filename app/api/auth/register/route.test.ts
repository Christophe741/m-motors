import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

// On mocke la couche données et la génération de token : la route est testée seule.
vi.mock("@/server/database", () => ({
  getUserByEmail: vi.fn(),
  createUser: vi.fn(),
}));
vi.mock("@/lib/jwt", () => ({ signToken: vi.fn(async () => "jeton-test") }));

import { POST } from "@/app/api/auth/register/route";
import { getUserByEmail, createUser } from "@/server/database";

const validBody = {
  email: "new@user.com",
  mot_de_passe: "motdepasse",
  nom: "Doe",
  prenom: "John",
  telephone: "0600000000",
  adresse: "1 rue de Paris",
};

function req(body: unknown): NextRequest {
  return { json: async () => body } as NextRequest;
}

beforeEach(() => vi.clearAllMocks());

describe("POST /api/auth/register", () => {
  it("rejette des données invalides avec 400 (validation Zod)", async () => {
    const res = await POST(req({ ...validBody, email: "pas-un-email" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe("Email invalide");
  });

  it("rejette un mot de passe trop court avec 400", async () => {
    const res = await POST(req({ ...validBody, mot_de_passe: "123" }));
    expect(res.status).toBe(400);
  });

  it("retourne 409 si l'email existe déjà", async () => {
    vi.mocked(getUserByEmail).mockResolvedValue({ id: "u1" } as never);
    const res = await POST(req(validBody));
    expect(res.status).toBe(409);
    expect((await res.json()).error).toBe("Cet email est déjà utilisé");
  });

  it("crée l'utilisateur, pose le cookie et renvoie l'utilisateur sans mot de passe", async () => {
    vi.mocked(getUserByEmail).mockResolvedValue(null);
    vi.mocked(createUser).mockResolvedValue({
      id: "u1",
      role: "client",
      email: validBody.email,
      mot_de_passe: "hash",
    } as never);

    const res = await POST(req(validBody));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.user.mot_de_passe).toBeUndefined(); // le hash ne doit pas fuiter
    expect(res.cookies.get("mmotors_token")?.value).toBe("jeton-test");
  });

  it("retourne 500 si une erreur inattendue survient", async () => {
    vi.mocked(getUserByEmail).mockRejectedValue(new Error("DB down"));
    const res = await POST(req(validBody));
    expect(res.status).toBe(500);
  });
});
