import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("@/server/database", () => ({ getVehicleById: vi.fn() }));

import { GET } from "@/app/api/vehicles/[id]/route";
import { getVehicleById } from "@/server/database";

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const req = {} as NextRequest;

beforeEach(() => vi.clearAllMocks());

describe("GET /api/vehicles/[id]", () => {
  it("retourne le véhicule trouvé", async () => {
    vi.mocked(getVehicleById).mockResolvedValue({ id: "v1" } as never);
    const res = await GET(req, ctx("v1"));
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.id).toBe("v1");
  });

  it("retourne 404 si le véhicule n'existe pas", async () => {
    vi.mocked(getVehicleById).mockResolvedValue(null);
    const res = await GET(req, ctx("inconnu"));
    expect(res.status).toBe(404);
  });

  it("retourne 500 en cas d'erreur", async () => {
    vi.mocked(getVehicleById).mockRejectedValue(new Error("boom"));
    const res = await GET(req, ctx("v1"));
    expect(res.status).toBe(500);
  });
});
