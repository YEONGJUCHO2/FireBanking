export type LiabilityPurpose = "residence" | "investment" | "lifestyle_credit" | "other";

export type LiabilityInput = {
  id: string;
  purpose: LiabilityPurpose;
  balanceAmount: number;
  monthlyInterestAmount: number;
  monthlyPrincipalAmount: number;
};

export type AssetSnapshotCalculationInput = {
  cashAssetAmount: number;
  domesticHoldingValuationAmount: number;
  usListedManualValuationAmount: number;
  otherInvestmentAmount: number;
  realEstateAssetAmount: number;
  otherAssetAmount: number;
  liabilities: LiabilityInput[];
};

export type AssetSnapshotCalculationResult = {
  investmentAssetAmount: number;
  totalAssetAmount: number;
  totalLiabilityAmount: number;
  displayedNetWorth: number;
  fireCalculationNetWorth: number;
  monthlyDebtInterestAmount: number;
  monthlyDebtPrincipalAmount: number;
};
