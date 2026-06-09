import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("@/server/database", () => ({ getAllOptions: vi.fn() }));

import { GET } from "@/app/api/options/route";
import { getAllOptions } from "@/server/database";

const req = {
  method: "GET",
  nextUrl: { pathname: "/api/options" },
} as unknown as NextRequest;

beforeEach(() => vi.clearAllMocks());

describe("GET /api/options", () => {
  it("retourne la liste des options", async () => {
    vi.mocked(getAllOptions).mockResolvedValue([{ id: "o1", nom: "GPS" }] as never);
    const res = await GET(req);
    const json = await res.json();
    expect(json).toEqual([{ id: "o1", nom: "GPS" }]);
  });

  it("retourne 500 en cas d'erreur", async () => {
    vi.mocked(getAllOptions).mockRejectedValue(new Error("boom"));
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});
