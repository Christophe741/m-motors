import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse, type NextRequest } from "next/server";

// On mocke l'alerting : on vérifie seulement QU'il est déclenché (ou non),
// sans dépendre de son implémentation ni faire d'appel réseau.
vi.mock("@/lib/alerting", () => ({ sendAlert: vi.fn() }));

import { withErrorHandler, ApiError } from "@/lib/api-handler";
import { sendAlert } from "@/lib/alerting";

const req = {
  method: "GET",
  nextUrl: { pathname: "/api/test" },
} as unknown as NextRequest;

beforeEach(() => vi.clearAllMocks());

describe("withErrorHandler", () => {
  it("laisse passer une réponse normale", async () => {
    const handler = withErrorHandler(async () => NextResponse.json({ ok: true }));
    const res = await handler(req);
    expect(res.status).toBe(200);
    expect(sendAlert).not.toHaveBeenCalled();
  });

  it("traduit une ApiError en réponse 4xx propre, sans alerte", async () => {
    const handler = withErrorHandler(async () => {
      throw new ApiError(422, "donnée invalide");
    });
    const res = await handler(req);

    expect(res.status).toBe(422);
    expect((await res.json()).error).toBe("donnée invalide");
    expect(sendAlert).not.toHaveBeenCalled(); // erreur métier => pas d'alerte
  });

  it("traduit une erreur inattendue en 500 et déclenche une alerte", async () => {
    const handler = withErrorHandler(async () => {
      throw new Error("boom");
    });
    const res = await handler(req);

    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe("Erreur serveur");
    expect(sendAlert).toHaveBeenCalledTimes(1); // erreur serveur => alerte
  });

  it("gère aussi une exception qui n'est pas un Error (throw d'une string)", async () => {
    const handler = withErrorHandler(async () => {
      throw "panne brute";
    });
    const res = await handler(req);

    expect(res.status).toBe(500);
    expect(sendAlert).toHaveBeenCalledTimes(1);
  });
});
