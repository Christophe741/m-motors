import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/auth/logout/route";

describe("POST /api/auth/logout", () => {
  it("vide le cookie de session (maxAge 0)", async () => {
    const res = await POST();
    const json = await res.json();
    expect(json.success).toBe(true);

    const cookie = res.cookies.get("mmotors_token");
    expect(cookie?.value).toBe("");
    expect(cookie?.maxAge).toBe(0);
  });
});
