# FIRE Asset Diagnosis Implementation Plan

> Document status: historical implementation plan. Current product scope and priorities live in `fire_couple_app_prd_v2.md`. Keep this file only for asset diagnosis implementation history.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reframe `/assets` from a generic asset/liability manager into a FIRE asset diagnosis surface where FIRE reflected investment assets equal immediately usable investment assets minus investment-linked loans.

**Architecture:** Keep the current `InvestmentAssetPanel` and `LiabilityPanel` components, but change their language, grouping, and summary calculations to match the new product model. Centralize the loan inclusion rule in `src/features/assets/lib/assetCalculations.ts`, then make dashboard and assets UI use the same rule. Avoid touching `/subscribe` files because another session is actively working there.

**Tech Stack:** Next.js App Router, React client components, TypeScript, Vitest, Testing Library, existing Fire Banking UI components.

---

## File Map

- Modify `src/features/assets/types.ts`
  - Clarify the existing `investment` liability purpose as the only debt type that reduces FIRE reflected investment assets.
  - Keep the existing enum values to avoid DB/schema churn.

- Modify `src/features/assets/lib/assetCalculations.ts`
  - Replace `shouldSubtractFromFireNetWorth()` with an investment-linked loan rule.
  - Keep result property names for compatibility, but make `fireCalculationNetWorth` mean FIRE reflected investment assets.

- Modify `src/features/assets/lib/assetCalculations.test.ts`
  - Update tests so only `purpose: "investment"` liabilities reduce FIRE reflected investment assets.
  - Assert `lifestyle_credit`, `residence`, and `other` do not reduce the asset diagnosis KPI.

- Modify `src/features/assets/components/InvestmentAssetPanel.tsx`
  - Rename screen copy from generic investment assets to FIRE reflected investment assets.
  - Group general/other holdings under FIRE reflected assets and pension/IRP under restricted/future assets.
  - Show quantity, unit price, and valuation as first-class card information.

- Modify `src/features/assets/components/InvestmentAssetPanel.test.tsx`
  - Assert cards show `보유 1주`, `기준가`, and `평가액`.
  - Replace the old assertion that quantity is hidden.

- Modify `src/features/assets/components/LiabilityPanel.tsx`
  - Reframe the panel as `투자 연동 대출`.
  - Show total investment-linked loan balance as the primary KPI.
  - Keep monthly interest/principal visible as secondary context, not the core FIRE KPI.
  - Label non-investment liabilities as excluded from this KPI if they are present.

- Modify `src/features/assets/components/LiabilityPanel.test.tsx`
  - Assert investment-linked loan copy and summary behavior.

- Modify `app/assets/page.tsx`
  - Rename page title to `FIRE 자산 진단`.
  - Update subtitle to explain that this tab validates the investment asset KPI for FIRE.

- Modify `app/assets/page.test.tsx`
  - Assert the new page title and copy.

- Modify `app/dashboard/page.tsx`
  - Rename dashboard link to `FIRE 자산 진단`.
  - Update dashboard derivation so only investment-linked loans are subtracted from FIRE reflected investment assets.
  - Keep this edit small because dashboard may be touched by another session.

- Modify `app/dashboard/page.test.tsx`
  - Add/adjust a test proving pension/IRP holdings are excluded and only investment loans are subtracted.

---

### Task 1: Lock the FIRE Asset Calculation Rule

**Files:**
- Modify: `src/features/assets/lib/assetCalculations.test.ts`
- Modify: `src/features/assets/lib/assetCalculations.ts`

- [ ] **Step 1: Write failing tests for the new debt rule**

Replace the old test named `"subtracts investment and lifestyle liabilities from FIRE net worth"` with:

```ts
it("subtracts only investment-linked loans from FIRE reflected investment assets", () => {
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
      {
        id: "other-loan",
        purpose: "other",
        balanceAmount: 7_000_000,
        monthlyInterestAmount: 30_000,
        monthlyPrincipalAmount: 100_000,
      },
    ],
  });

  expect(result.displayedNetWorth).toBe(43_000_000);
  expect(result.fireCalculationNetWorth).toBe(55_000_000);
  expect(result.monthlyDebtInterestAmount).toBe(180_000);
  expect(result.monthlyDebtPrincipalAmount).toBe(600_000);
});
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```bash
npm test -- src/features/assets/lib/assetCalculations.test.ts
```

Expected: FAIL because `lifestyle_credit` and `other` are still subtracted from `fireCalculationNetWorth`.

- [ ] **Step 3: Implement the new rule**

Change `src/features/assets/lib/assetCalculations.ts`:

```ts
function shouldSubtractFromFireReflectedInvestmentAssets(liability: LiabilityInput) {
  return liability.purpose === "investment";
}
```

Then update the filter:

```ts
const fireIncludedLiabilityAmount = input.liabilities
  .filter(shouldSubtractFromFireReflectedInvestmentAssets)
  .reduce((total, liability) => total + liability.balanceAmount, 0);
```

- [ ] **Step 4: Run the focused test and confirm it passes**

Run:

```bash
npm test -- src/features/assets/lib/assetCalculations.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 1**

```bash
git add src/features/assets/lib/assetCalculations.ts src/features/assets/lib/assetCalculations.test.ts
git commit -m "refactor: count only investment loans in fire assets"
```

---

### Task 2: Make Holding Cards Show the KPI Inputs Clearly

**Files:**
- Modify: `src/features/assets/components/InvestmentAssetPanel.test.tsx`
- Modify: `src/features/assets/components/InvestmentAssetPanel.tsx`

- [ ] **Step 1: Write failing card display assertions**

In the `"separates holdings by account category and keeps symbols beside category chips"` test, replace:

```ts
expect(within(generalSection).queryByText("1")).not.toBeInTheDocument();
```

with:

```ts
expect(within(generalSection).getByText("보유 1주")).toBeInTheDocument();
expect(within(generalSection).getByText("기준가 ₩252,000")).toBeInTheDocument();
expect(within(generalSection).getByText("평가액 ₩252,000")).toBeInTheDocument();
expect(within(pensionSection).getByText("제한·미래 자산")).toBeInTheDocument();
expect(within(irpSection).getByText("제한·미래 자산")).toBeInTheDocument();
```

- [ ] **Step 2: Run the focused component test and confirm it fails**

Run:

```bash
npm test -- src/features/assets/components/InvestmentAssetPanel.test.tsx
```

Expected: FAIL because the card does not show quantity/unit price/valuation labels.

- [ ] **Step 3: Add a small unit-price helper**

Add near the existing formatting helpers in `InvestmentAssetPanel.tsx`:

```ts
function getUnitPrice(holding: HoldingView) {
  if (holding.lastClosePrice && holding.lastClosePrice > 0) {
    return holding.lastClosePrice;
  }

  if (holding.quantity > 0) {
    return Math.round(holding.valuationAmount / holding.quantity);
  }

  return 0;
}

function getDiagnosisCategoryLabel(accountCategory: AccountCategory) {
  return accountCategory === "pension_savings" || accountCategory === "irp"
    ? "제한·미래 자산"
    : "FIRE 반영";
}
```

- [ ] **Step 4: Update the holding card markup**

Inside the `section.holdings.map((holding) => (` block, define before return if needed:

```ts
const accountCategory = holding.accountCategory ?? "general";
const unitPrice = getUnitPrice(holding);
```

Then keep the existing name/category/symbol row, but add this non-edit display under it when not editing:

```tsx
{editingId === holding.id ? (
  <div className="mt-2 flex items-center gap-2">
    <label className="sr-only" htmlFor={`${holding.id}-quantity`}>
      {holding.displayName} 보유 수량
    </label>
    <input
      id={`${holding.id}-quantity`}
      value={editingQuantity}
      onChange={(event) => setEditingQuantity(event.target.value)}
      className="h-9 w-24 rounded-[10px] border border-fb-line bg-white px-3 text-[13px] font-semibold text-fb-ink outline-none focus:border-fb-trust"
      inputMode="decimal"
    />
    <span className="text-[12px] font-medium text-fb-ink-3">주</span>
  </div>
) : (
  <div className="mt-3 grid grid-cols-3 gap-2 rounded-[12px] bg-fb-card-alt p-3">
    <div>
      <p className="text-[11px] font-bold text-fb-ink-3">보유</p>
      <p className="fb-num mt-1 text-[13px] font-bold text-fb-ink">
        {formatPlainNumber(holding.quantity)}주
      </p>
    </div>
    <div>
      <p className="text-[11px] font-bold text-fb-ink-3">기준가</p>
      <p className="fb-num mt-1 text-[13px] font-bold text-fb-ink">{formatKrw(unitPrice)}</p>
    </div>
    <div>
      <p className="text-[11px] font-bold text-fb-ink-3">평가액</p>
      <p className="fb-num mt-1 text-[13px] font-bold text-fb-ink">
        {formatKrw(holding.valuationAmount)}
      </p>
    </div>
  </div>
)}
```

Also add the diagnosis category chip beside the account chip:

```tsx
<span className="rounded-full bg-fb-card-alt px-2 py-0.5 text-[11px] font-bold text-fb-ink-3">
  {getDiagnosisCategoryLabel(accountCategory)}
</span>
```

- [ ] **Step 5: Remove the duplicate unlabelled valuation**

In the lower card action row, remove the standalone:

```tsx
<p className="fb-num text-[15px] font-bold text-fb-ink">
  {formatKrw(holding.valuationAmount)}
</p>
```

Replace it with:

```tsx
<p className="text-[12px] font-medium text-fb-ink-3">
  {getDiagnosisCategoryLabel(accountCategory)} 기준
</p>
```

- [ ] **Step 6: Run the focused component test**

Run:

```bash
npm test -- src/features/assets/components/InvestmentAssetPanel.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit Task 2**

```bash
git add src/features/assets/components/InvestmentAssetPanel.tsx src/features/assets/components/InvestmentAssetPanel.test.tsx
git commit -m "feat: show fire asset holding quantities"
```

---

### Task 3: Reframe the Liability Panel as Investment-Linked Loans

**Files:**
- Modify: `src/features/assets/components/LiabilityPanel.test.tsx`
- Modify: `src/features/assets/components/LiabilityPanel.tsx`

- [ ] **Step 1: Write failing liability copy assertions**

Update `"shows liability policy copy and edit affordance"`:

```ts
expect(screen.getByText("투자 연동 대출")).toBeInTheDocument();
expect(screen.getByText(/투자자산을 만들기 위해 낀 대출만 FIRE 반영 투자자산에서 차감해요/)).toBeInTheDocument();
expect(screen.getByText("차감 대상 대출")).toBeInTheDocument();
expect(screen.getByText("월 이자")).toBeInTheDocument();
expect(screen.getByText("월 원금상환")).toBeInTheDocument();
```

Replace older assertions that require `은행 앱의 상환 안내` and `거주 부동산 관련`.

- [ ] **Step 2: Run focused test and confirm it fails**

Run:

```bash
npm test -- src/features/assets/components/LiabilityPanel.test.tsx
```

Expected: FAIL because the panel still says generic `부채`.

- [ ] **Step 3: Add explicit summary totals**

In `LiabilityPanel.tsx`, add:

```ts
const investmentLinkedLoanBalance = items
  .filter((liability) => liability.purpose === "investment")
  .reduce((sum, liability) => sum + liability.balanceAmount, 0);
const monthlyInterest = items.reduce(
  (sum, liability) => sum + liability.monthlyInterestAmount,
  0,
);
const monthlyPrincipal = items.reduce(
  (sum, liability) => sum + liability.monthlyPrincipalAmount,
  0,
);
```

Keep `totalBalance` only if still needed for secondary copy; otherwise remove it.

- [ ] **Step 4: Update panel header and summary cards**

Change the section header to:

```tsx
<SectionHeader
  title="투자 연동 대출"
  subtitle="투자자산을 만들기 위해 낀 대출만 FIRE 반영 투자자산에서 차감해요."
  action={<StatusPill label={isPending ? "저장 중" : "FIRE 보정"} status="info" />}
/>
```

Change summary cards to:

```tsx
<div className="grid grid-cols-3 gap-3">
  <Summary label="차감 대상 대출" value={formatKrw(investmentLinkedLoanBalance)} />
  <Summary label="월 이자" value={formatKrw(monthlyInterest)} />
  <Summary label="월 원금상환" value={formatKrw(monthlyPrincipal)} />
</div>
```

Change the explanatory copy to:

```tsx
<p className="mt-4 rounded-[12px] bg-white px-3 py-3 text-[12px] leading-5 text-fb-ink-3">
  우리사주 대출, 주식담보대출처럼 투자자산을 사기 위해 빌린 돈은 투자자산 평가액에서 빼야 FIRE 금액을 과대평가하지 않아요.
</p>
<p className="mt-3 text-[12px] leading-5 text-fb-ink-3">
  주거/생활 부채는 이 진단 KPI에서 기본 제외하고, 생활비 조정기나 월 현금흐름에서 따로 다뤄요.
</p>
```

- [ ] **Step 5: Update each liability row copy**

For non-editing row text, replace the current detail with:

```tsx
<p className="mt-1 text-[12px] text-fb-ink-3">
  {liability.purpose === "investment" ? "FIRE 반영 투자자산에서 차감" : "이 진단 KPI에서는 제외"} ·
  이자 {formatKrw(liability.monthlyInterestAmount)} · 원금상환{" "}
  {formatKrw(liability.monthlyPrincipalAmount)}
</p>
```

- [ ] **Step 6: Run focused liability test**

Run:

```bash
npm test -- src/features/assets/components/LiabilityPanel.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit Task 3**

```bash
git add src/features/assets/components/LiabilityPanel.tsx src/features/assets/components/LiabilityPanel.test.tsx
git commit -m "feat: frame liabilities as investment linked loans"
```

---

### Task 4: Rename the Assets Page and Dashboard Link

**Files:**
- Modify: `app/assets/page.tsx`
- Modify: `app/assets/page.test.tsx`
- Modify: `app/dashboard/page.tsx`
- Modify: `app/dashboard/page.test.tsx`

- [ ] **Step 1: Write/adjust page title tests**

In `app/assets/page.test.tsx`, assert:

```ts
expect(screen.getAllByText("FIRE 자산 진단").length).toBeGreaterThan(0);
expect(screen.getByText(/투자자산 KPI를 검증해요/)).toBeInTheDocument();
```

In `app/dashboard/page.test.tsx`, replace old link label expectations with:

```ts
expect(screen.getAllByText("FIRE 자산 진단").length).toBeGreaterThan(0);
```

- [ ] **Step 2: Run focused page tests and confirm they fail**

Run:

```bash
npm test -- app/assets/page.test.tsx app/dashboard/page.test.tsx
```

Expected: FAIL because labels still say `자산·부채 관리`.

- [ ] **Step 3: Update `/assets` page copy**

In `app/assets/page.tsx`, change mobile header:

```tsx
<AppHeader
  title="FIRE 자산 진단"
  subtitle="FIRE까지 남은 금액에 들어갈 투자자산 KPI를 검증해요."
  backHref="/dashboard"
/>
```

Change desktop title/subtitle:

```tsx
<h1 className="text-[30px] font-bold tracking-[-0.024em] text-fb-ink">
  FIRE 자산 진단
</h1>
<p className="mt-2 text-[14px] font-medium text-fb-ink-3">
  바로 쓸 수 있는 투자자산과 투자 연동 대출을 분리해서 FIRE 반영 금액을 확인해요.
</p>
```

- [ ] **Step 4: Update dashboard link copy**

In `AssetManagementLink()` inside `app/dashboard/page.tsx`, change:

```tsx
<span className="block text-[14px] font-bold text-fb-ink">FIRE 자산 진단</span>
<span className="mt-0.5 block text-[12px] font-medium text-fb-ink-3">
  {linkedAssetCount
    ? `${linkedAssetCount.toLocaleString("ko-KR")}개 투자자산이 FIRE 금액에 반영 중`
    : "투자자산과 투자 연동 대출을 분리해요"}
</span>
```

- [ ] **Step 5: Run focused page tests**

Run:

```bash
npm test -- app/assets/page.test.tsx app/dashboard/page.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit Task 4**

```bash
git add app/assets/page.tsx app/assets/page.test.tsx app/dashboard/page.tsx app/dashboard/page.test.tsx
git commit -m "refactor: rename assets area to fire diagnosis"
```

---

### Task 5: Align Dashboard FIRE Asset Derivation

**Files:**
- Modify: `app/dashboard/page.test.tsx`
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Add a dashboard derivation test**

In `app/dashboard/page.test.tsx`, add a test where:

- general holding valuation is `50_000_000`
- pension holding valuation is `10_000_000`
- investment loan is `15_000_000`
- lifestyle loan is `5_000_000`

Expected dashboard FIRE reflected asset amount should be `3,500만원`, not `3,000만원`, because only the investment loan is subtracted.

Use the existing mock pattern for `getAssetManagementData()` and assert the rendered FIRE net worth/breakdown text that currently displays `FIRE 계산 순자산` or the matching dashboard metric.

- [ ] **Step 2: Run dashboard test and confirm it fails**

Run:

```bash
npm test -- app/dashboard/page.test.tsx
```

Expected: FAIL because dashboard currently subtracts `lifestyle_credit`.

- [ ] **Step 3: Update dashboard liability filter**

In `deriveDashboardData()` inside `app/dashboard/page.tsx`, change:

```ts
const fireIncludedLiabilityAmount = registeredLiabilities
  .filter((liability) => liability.purpose === "investment")
  .reduce((total, liability) => total + liability.balanceAmount, 0);
```

- [ ] **Step 4: Run dashboard test**

Run:

```bash
npm test -- app/dashboard/page.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit Task 5**

```bash
git add app/dashboard/page.tsx app/dashboard/page.test.tsx
git commit -m "fix: subtract only investment loans on dashboard"
```

---

### Task 6: Verification and Browser QA

**Files:**
- No code files unless verification finds a bug.

- [ ] **Step 1: Run targeted tests**

Run:

```bash
npm test -- src/features/assets/lib/assetCalculations.test.ts src/features/assets/components/InvestmentAssetPanel.test.tsx src/features/assets/components/LiabilityPanel.test.tsx app/assets/page.test.tsx app/dashboard/page.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run full project checks if the other session has not left known broken `/subscribe` changes**

Check:

```bash
git status --short
```

If `/subscribe` files are still modified by the other session, do not claim full-project verification for this task. Run asset/dashboard targeted tests only and document the reason.

If the other session has committed or cleaned its work, run:

```bash
npm test
npm run lint
npm run build
```

Expected: all PASS.

- [ ] **Step 3: In-app browser QA**

Open `/assets` in the in-app browser and verify:

- Page title is `FIRE 자산 진단`.
- General account holding cards show quantity, unit price, and valuation without pressing edit.
- Pension/IRP holdings are marked `제한·미래 자산`.
- Liability section is `투자 연동 대출`.
- Investment-linked loan balance is shown separately from monthly interest/principal.
- No horizontal clipping on mobile.

- [ ] **Step 4: Final commit if any verification fixes were needed**

If any fixes were made:

```bash
git add src/features/assets app/assets app/dashboard
git commit -m "fix: polish fire asset diagnosis"
```

---

## Self-Review Notes

- Spec coverage: The plan covers FIRE reflected investment assets, restricted/future assets, investment-linked loans, card quantity visibility, dashboard linkage, and mobile browser verification.
- Deliberate deferral: It does not implement real estate, all-debt accounting, or advanced include/exclude settings because the spec explicitly excludes them.
- Conflict control: `/subscribe` files are intentionally untouched because another session is working on the FIRE living expense adjuster.
