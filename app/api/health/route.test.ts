import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

const prismaMock = vi.hoisted(() => ({ $queryRaw: vi.fn() }));
vi.mock("@/server/prisma", () => ({ prisma: prismaMock }));

import { GET } from "@/app/api/health/route";

const req = {
  method: "GET",
  nextUrl: { pathname: "/api/health" },
} as unknown as NextRequest;

beforeEach(() => vi.clearAllMocks());

describe("GET /api/health", () => {
  it("retourne 200 et 'up' quand la base répond", async () => {
    prismaMock.$queryRaw.mockResolvedValue([{ ok: 1 }]);
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.status).toBe("ok");
    expect(json.database).toBe("up");
  });

  it("retourne 503 et 'down' quand la base est injoignable", async () => {
    prismaMock.$queryRaw.mockRejectedValue(new Error("connexion refusée"));
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json.status).toBe("error");
    expect(json.database).toBe("down");
  });
});
