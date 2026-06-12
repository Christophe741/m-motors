import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("@/server/database", () => ({ getAllMarques: vi.fn() }));

import { GET } from "@/app/api/marques/route";
import { getAllMarques } from "@/server/database";

const req = {
  method: "GET",
  nextUrl: { pathname: "/api/marques" },
} as unknown as NextRequest;

beforeEach(() => vi.clearAllMocks());

describe("GET /api/marques", () => {
  it("retourne la liste des marques", async () => {
    vi.mocked(getAllMarques).mockResolvedValue(["Audi", "BMW"]);
    const res = await GET(req);
    const json = await res.json();
    expect(json).toEqual({ success: true, data: ["Audi", "BMW"] });
  });

  it("retourne 500 en cas d'erreur", async () => {
    vi.mocked(getAllMarques).mockRejectedValue(new Error("boom"));
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});
