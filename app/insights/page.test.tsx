import { describe, expect, it, vi } from "vitest";
import InsightsPage from "./page";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

describe("InsightsPage", () => {
  it("redirects away from the removed standalone analysis surface", () => {
    expect(() => InsightsPage()).toThrow("redirect:/dashboard");
    expect(mocks.redirect).toHaveBeenCalledWith("/dashboard");
  });
});
