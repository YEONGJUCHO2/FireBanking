import { describe, expect, it } from "vitest";
import { r0OnboardingSchema } from "./r0OnboardingSchema";

describe("r0OnboardingSchema", () => {
  it("accepts valid manwon inputs and normalizes them to Korean won", () => {
    const result = r0OnboardingSchema.parse({
      monthlyNetIncome: "720",
      investableNetWorth: "12000",
      primaryResidenceNetWorth: "70000",
      otherNetWorth: "2000",
      monthlyFixedExpense: "230",
      monthlyVariableExpense: "170",
      monthlyRegularInvestment: "200",
    });

    expect(result.monthlyNetIncome).toBe(7_200_000);
    expect(result.investableNetWorth).toBe(120_000_000);
    expect(result.primaryResidenceNetWorth).toBe(700_000_000);
    expect(result.otherNetWorth).toBe(20_000_000);
  });

  it("accepts comma-formatted manwon inputs", () => {
    const result = r0OnboardingSchema.parse({
      monthlyNetIncome: "720",
      investableNetWorth: "12,000",
      primaryResidenceNetWorth: "70,000",
      otherNetWorth: "2,000",
      monthlyFixedExpense: "230",
      monthlyVariableExpense: "170",
      monthlyRegularInvestment: "200",
    });

    expect(result.investableNetWorth).toBe(120_000_000);
    expect(result.primaryResidenceNetWorth).toBe(700_000_000);
    expect(result.otherNetWorth).toBe(20_000_000);
  });

  it("defaults optional residence and other net worth inputs to zero when blank", () => {
    const result = r0OnboardingSchema.parse({
      monthlyNetIncome: "720",
      investableNetWorth: "12000",
      primaryResidenceNetWorth: "",
      otherNetWorth: "",
      monthlyFixedExpense: "230",
      monthlyVariableExpense: "170",
      monthlyRegularInvestment: "200",
    });

    expect(result.primaryResidenceNetWorth).toBe(0);
    expect(result.otherNetWorth).toBe(0);
  });

  it("rejects blank required money inputs", () => {
    const result = r0OnboardingSchema.safeParse({
      monthlyNetIncome: "",
      investableNetWorth: "12000",
      primaryResidenceNetWorth: "",
      otherNetWorth: "",
      monthlyFixedExpense: "230",
      monthlyVariableExpense: "170",
      monthlyRegularInvestment: "200",
    });

    expect(result.success).toBe(false);
  });

  it("rejects negative manwon values", () => {
    const result = r0OnboardingSchema.safeParse({
      monthlyNetIncome: "-1",
      investableNetWorth: "12000",
      primaryResidenceNetWorth: "70000",
      otherNetWorth: "2000",
      monthlyFixedExpense: "230",
      monthlyVariableExpense: "170",
      monthlyRegularInvestment: "200",
    });

    expect(result.success).toBe(false);
  });
});
