import { describe, it, expect } from "vitest";
import type { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/logout/route";

const req = {
  method: "POST",
  nextUrl: { pathname: "/api/auth/logout" },
} as unknown as NextRequest;

describe("POST /api/auth/logout", () => {
  it("vide le cookie de session (maxAge 0)", async () => {
    const res = await POST(req);
    const json = await res.json();
    expect(json.success).toBe(true);

    const cookie = res.cookies.get("mmotors_token");
    expect(cookie?.value).toBe("");
    expect(cookie?.maxAge).toBe(0);
  });
});
