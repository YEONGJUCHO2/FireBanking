import { describe, expect, it } from "vitest";
import { suggestFireMonthlyExpenseFromSpending } from "./suggestFireMonthlyExpense";

describe("suggestFireMonthlyExpenseFromSpending", () => {
  it("adds a transparent 10 percent buffer to current monthly spending", () => {
    expect(suggestFireMonthlyExpenseFromSpending(4_000_000)).toBe(4_400_000);
  });

  it("keeps empty spending empty instead of inventing a target", () => {
    expect(suggestFireMonthlyExpenseFromSpending(0)).toBe(0);
  });
});
