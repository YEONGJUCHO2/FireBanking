import { describe, expect, it } from "vitest";
import { r0OnboardingSchema } from "./r0OnboardingSchema";

describe("r0OnboardingSchema", () => {
  it("accepts valid manwon inputs and normalizes them to Korean won", () => {
    const result = r0OnboardingSchema.parse({
      targetMonthlyExpense: "300",
      monthlyNetIncome: "720",
      investableNetWorth: "12000",
      monthlyFixedExpense: "230",
      monthlyVariableExpense: "170",
      monthlyRegularInvestment: "200",
    });

    expect(result.targetMonthlyExpense).toBe(3_000_000);
    expect(result.monthlyNetIncome).toBe(7_200_000);
    expect(result.investableNetWorth).toBe(120_000_000);
  });

  it("accepts comma-formatted manwon inputs", () => {
    const result = r0OnboardingSchema.parse({
      targetMonthlyExpense: "300",
      monthlyNetIncome: "720",
      investableNetWorth: "12,000",
      monthlyFixedExpense: "230",
      monthlyVariableExpense: "170",
      monthlyRegularInvestment: "200",
    });

    expect(result.investableNetWorth).toBe(120_000_000);
  });

  it("does not require residence and other net worth in the first FIRE setup", () => {
    const result = r0OnboardingSchema.parse({
      targetMonthlyExpense: "300",
      monthlyNetIncome: "720",
      investableNetWorth: "12000",
      monthlyFixedExpense: "230",
      monthlyVariableExpense: "170",
      monthlyRegularInvestment: "200",
    });

    expect(result.investableNetWorth).toBe(120_000_000);
  });

  it("rejects blank required money inputs", () => {
    const result = r0OnboardingSchema.safeParse({
      targetMonthlyExpense: "300",
      monthlyNetIncome: "",
      investableNetWorth: "12000",
      monthlyFixedExpense: "230",
      monthlyVariableExpense: "170",
      monthlyRegularInvestment: "200",
    });

    expect(result.success).toBe(false);
  });

  it("rejects negative manwon values", () => {
    const result = r0OnboardingSchema.safeParse({
      targetMonthlyExpense: "300",
      monthlyNetIncome: "-1",
      investableNetWorth: "12000",
      monthlyFixedExpense: "230",
      monthlyVariableExpense: "170",
      monthlyRegularInvestment: "200",
    });

    expect(result.success).toBe(false);
  });
});
