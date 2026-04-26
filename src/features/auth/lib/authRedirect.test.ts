import { describe, expect, it } from "vitest";
import { getSafeAuthRedirectPath } from "./authRedirect";

describe("getSafeAuthRedirectPath", () => {
  it("defaults to onboarding when next is missing", () => {
    expect(getSafeAuthRedirectPath(null)).toBe("/onboarding");
  });

  it("allows app-local invite paths", () => {
    expect(getSafeAuthRedirectPath("/invite/token-1")).toBe("/invite/token-1");
  });

  it("rejects external or protocol-relative redirects", () => {
    expect(getSafeAuthRedirectPath("https://evil.example")).toBe("/onboarding");
    expect(getSafeAuthRedirectPath("//evil.example")).toBe("/onboarding");
  });
});
