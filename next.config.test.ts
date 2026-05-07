import { describe, expect, it } from "vitest";
import nextConfig from "./next.config";

describe("next security headers", () => {
  it("sets browser hardening headers for all routes", async () => {
    expect(typeof nextConfig.headers).toBe("function");

    const headers = await nextConfig.headers?.();
    const routeHeaders = headers?.find((entry) => entry.source === "/(.*)")?.headers ?? [];
    const headerValues = new Map(routeHeaders.map((header) => [header.key, header.value]));

    expect(headerValues.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
    expect(headerValues.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headerValues.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headerValues.get("Permissions-Policy")).toContain("camera=()");
  });
});
