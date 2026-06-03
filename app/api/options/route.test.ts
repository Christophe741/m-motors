import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/server/database", () => ({ getAllOptions: vi.fn() }));

import { GET } from "@/app/api/options/route";
import { getAllOptions } from "@/server/database";

beforeEach(() => vi.clearAllMocks());

describe("GET /api/options", () => {
  it("retourne la liste des options", async () => {
    vi.mocked(getAllOptions).mockResolvedValue([{ id: "o1", nom: "GPS" }] as never);
    const res = await GET();
    const json = await res.json();
    expect(json).toEqual([{ id: "o1", nom: "GPS" }]);
  });

  it("retourne 500 en cas d'erreur", async () => {
    vi.mocked(getAllOptions).mockRejectedValue(new Error("boom"));
    const res = await GET();
    expect(res.status).toBe(500);
  });
});
