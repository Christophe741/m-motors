import { describe, it, expect } from "vitest";
import type { NextRequest } from "next/server";
import { signToken, verifyToken, getAuthUser } from "@/lib/jwt";

describe("signToken / verifyToken", () => {
  it("signe un token vérifiable qui contient sub et role", async () => {
    const token = await signToken({ sub: "user-123", role: "admin" });
    expect(typeof token).toBe("string");

    const payload = await verifyToken(token);
    expect(payload).toEqual({ sub: "user-123", role: "admin" });
  });

  it("retourne null pour un token invalide", async () => {
    expect(await verifyToken("pas-un-vrai-token")).toBeNull();
  });

  it("retourne null pour un token signé avec une autre clé", async () => {
    // Token signé avec un secret différent : la vérification doit échouer
    const fauxToken =
      "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ4In0.signature-bidon";
    expect(await verifyToken(fauxToken)).toBeNull();
  });
});

// Petit utilitaire pour simuler une NextRequest avec (ou sans) cookie
function fakeRequest(token?: string): NextRequest {
  return {
    cookies: {
      get: (name: string) =>
        name === "mmotors_token" && token ? { value: token } : undefined,
    },
  } as unknown as NextRequest;
}

describe("getAuthUser", () => {
  it("retourne le payload quand le cookie contient un token valide", async () => {
    const token = await signToken({ sub: "u1", role: "client" });
    const user = await getAuthUser(fakeRequest(token));
    expect(user).toEqual({ sub: "u1", role: "client" });
  });

  it("retourne null quand le cookie est absent", async () => {
    expect(await getAuthUser(fakeRequest())).toBeNull();
  });

  it("retourne null quand le token du cookie est invalide", async () => {
    expect(await getAuthUser(fakeRequest("token-corrompu"))).toBeNull();
  });
});
