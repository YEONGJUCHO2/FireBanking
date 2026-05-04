import { describe, expect, it } from "vitest";
import { getKstMonthEndDate, getSnapshotMonthDate } from "./monthEndSnapshot";

describe("monthEndSnapshot", () => {
  it("returns the KST month-end date", () => {
    expect(getKstMonthEndDate(new Date("2026-05-01T00:00:00.000Z"))).toBe("2026-05-31");
  });

  it("returns the first day snapshot month key", () => {
    expect(getSnapshotMonthDate("2026-05-31")).toBe("2026-05-01");
  });

  it("handles February in a leap year", () => {
    expect(getKstMonthEndDate(new Date("2028-02-10T12:00:00.000Z"))).toBe("2028-02-29");
  });
});
