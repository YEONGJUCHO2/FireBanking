import { describe, expect, it } from "vitest";
import { calculateAssetSnapshotInputs } from "./assetCalculations";

describe("calculateAssetSnapshotInputs", () => {
  it("adds domestic auto valuation and other investments into investment assets", () => {
    const result = calculateAssetSnapshotInputs({
      cashAssetAmount: 10_000_000,
      domesticHoldingValuationAmount: 42_300_000,
      usListedManualValuationAmount: 0,
      otherInvestmentAmount: 7_700_000,
      realEstateAssetAmount: 300_000_000,
      otherAssetAmount: 2_000_000,
      liabilities: [],
    });

    expect(result.investmentAssetAmount).toBe(50_000_000);
    expect(result.totalAssetAmount).toBe(362_000_000);
    expect(result.displayedNetWorth).toBe(362_000_000);
  });

  it("adds US-listed manual-assist valuation into investment assets", () => {
    const result = calculateAssetSnapshotInputs({
      cashAssetAmount: 10_000_000,
      domesticHoldingValuationAmount: 20_000_000,
      usListedManualValuationAmount: 15_000_000,
      otherInvestmentAmount: 5_000_000,
      realEstateAssetAmount: 0,
      otherAssetAmount: 0,
      liabilities: [],
    });

    expect(result.investmentAssetAmount).toBe(40_000_000);
    expect(result.fireCalculationNetWorth).toBe(50_000_000);
  });

  it("excludes residence-related liabilities from default FIRE net worth", () => {
    const result = calculateAssetSnapshotInputs({
      cashAssetAmount: 20_000_000,
      domesticHoldingValuationAmount: 50_000_000,
      usListedManualValuationAmount: 0,
      otherInvestmentAmount: 0,
      realEstateAssetAmount: 500_000_000,
      otherAssetAmount: 0,
      liabilities: [
        {
          id: "home-loan",
          purpose: "residence",
          balanceAmount: 300_000_000,
          monthlyInterestAmount: 800_000,
          monthlyPrincipalAmount: 1_000_000,
        },
      ],
    });

    expect(result.displayedNetWorth).toBe(270_000_000);
    expect(result.fireCalculationNetWorth).toBe(70_000_000);
  });

  it("subtracts investment and lifestyle liabilities from FIRE net worth", () => {
    const result = calculateAssetSnapshotInputs({
      cashAssetAmount: 20_000_000,
      domesticHoldingValuationAmount: 50_000_000,
      usListedManualValuationAmount: 0,
      otherInvestmentAmount: 0,
      realEstateAssetAmount: 0,
      otherAssetAmount: 0,
      liabilities: [
        {
          id: "stock-loan",
          purpose: "investment",
          balanceAmount: 15_000_000,
          monthlyInterestAmount: 100_000,
          monthlyPrincipalAmount: 300_000,
        },
        {
          id: "credit-loan",
          purpose: "lifestyle_credit",
          balanceAmount: 5_000_000,
          monthlyInterestAmount: 50_000,
          monthlyPrincipalAmount: 200_000,
        },
      ],
    });

    expect(result.displayedNetWorth).toBe(50_000_000);
    expect(result.fireCalculationNetWorth).toBe(50_000_000);
    expect(result.monthlyDebtInterestAmount).toBe(150_000);
    expect(result.monthlyDebtPrincipalAmount).toBe(500_000);
  });
});
