import type {
  AssetSnapshotCalculationInput,
  AssetSnapshotCalculationResult,
  LiabilityInput,
} from "../types";

function shouldSubtractFromFireNetWorth(liability: LiabilityInput) {
  return liability.purpose !== "residence";
}

export function calculateAssetSnapshotInputs(
  input: AssetSnapshotCalculationInput,
): AssetSnapshotCalculationResult {
  const investmentAssetAmount =
    input.domesticHoldingValuationAmount +
    input.usListedManualValuationAmount +
    input.otherInvestmentAmount;
  const totalAssetAmount =
    input.cashAssetAmount +
    investmentAssetAmount +
    input.realEstateAssetAmount +
    input.otherAssetAmount;
  const totalLiabilityAmount = input.liabilities.reduce(
    (total, liability) => total + liability.balanceAmount,
    0,
  );
  const fireIncludedLiabilityAmount = input.liabilities
    .filter(shouldSubtractFromFireNetWorth)
    .reduce((total, liability) => total + liability.balanceAmount, 0);
  const monthlyDebtInterestAmount = input.liabilities.reduce(
    (total, liability) => total + liability.monthlyInterestAmount,
    0,
  );
  const monthlyDebtPrincipalAmount = input.liabilities.reduce(
    (total, liability) => total + liability.monthlyPrincipalAmount,
    0,
  );

  return {
    investmentAssetAmount,
    totalAssetAmount,
    totalLiabilityAmount,
    displayedNetWorth: totalAssetAmount - totalLiabilityAmount,
    fireCalculationNetWorth:
      input.cashAssetAmount + investmentAssetAmount - fireIncludedLiabilityAmount,
    monthlyDebtInterestAmount,
    monthlyDebtPrincipalAmount,
  };
}
