import { describe, expect, it } from "vitest";
import { getDashboardHeaderLinks } from "./dashboardRoleUi";

describe("getDashboardHeaderLinks", () => {
  it("keeps editing available for the owner account", () => {
    expect(getDashboardHeaderLinks("admin")).toEqual([
      { href: "/subscribe", label: "FIRE 생활비 조정기" },
      { href: "/onboarding", label: "이번 달 값 수정" },
    ]);
  });

  it("hides edit entry points for spouse read-only accounts", () => {
    expect(getDashboardHeaderLinks("lite")).toEqual([
      { href: "/subscribe", label: "FIRE 생활비 조정기" },
    ]);
  });
});
