# Investment Auto Valuation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first release of investment auto valuation: domestic listed holdings are valued from last trading-day close, liabilities are reflected, daily prices feed current estimates, and KST month-end snapshots are fixed for dashboard history.

**Architecture:** Add a focused `assets` feature module beside the existing `fire`, `dashboard`, and `onboarding` modules. Keep valuation and FIRE math in pure TypeScript functions first, then connect Supabase persistence, scheduled jobs, and UI surfaces around those pure functions. Treat Kiwoom as a provider behind a small domestic valuation interface, with Phase 0 required before using real API calls.

**Tech Stack:** Next.js App Router, TypeScript, Supabase Postgres/RLS, Zod, Vitest, Testing Library, protected Next.js cron route handlers, Kiwoom domestic market data candidate.

---

## Scope

This plan implements the design in `docs/superpowers/specs/2026-05-01-investment-auto-valuation-design.md`.

Included:

- Domestic stock/ETF instrument model.
- Search plus quantity holding registration.
- Other investment manual amount.
- Pension savings/IRP account category metadata.
- Simple liability model: residence-related, investment-related, lifestyle/credit-related, other.
- Pure calculation of displayed net worth, FIRE calculation net worth, monthly cashflow effects, and monthly asset growth capacity.
- Daily price snapshot sync interface.
- KST month-end automatic snapshot creation with `couple_id + snapshot_month` idempotency.
- Dashboard history data shape and current estimate versus fixed snapshot distinction.

Excluded:

- US-listed holdings auto valuation.
- USD/KRW conversion.
- Brokerage account connection.
- CSV or bulk paste import.
- Sell transaction cash ledger.
- Portfolio analytics.

## Execution Phases

This is one product release, but implementation must land in smaller engineering phases.
Do not combine all phases into one unchecked diff.

```text
Phase A. Calculation and schema foundation
- Pure asset/liability calculations
- FIRE projection compatibility
- Supabase schema and RLS
- Relationship between existing cashflow snapshots and new asset snapshots

Phase B. Search and manual input
- Domestic instrument search action/API
- Holding save action
- Liability save action
- Investment/liability panels

Phase C. Price sync infrastructure
- Provider boundary
- Kiwoom config shell behind credentials
- Daily price sync job
- Protected scheduler route

Phase D. Month-end and dashboard history
- Month-end snapshot job
- Protected scheduler route
- Current estimate versus fixed snapshot dashboard summary
```

Each phase must have its own focused tests and commit. A later phase can depend on an
earlier phase, but it must not silently fix earlier phase behavior without adding a
regression test.

## Snapshot Source Of Truth

The existing `monthly_cashflow_snapshots` table remains the source of truth for monthly
income, expenses, regular investment, and the R0 FIRE projection fields.

The new `monthly_asset_snapshots` table is a supplemental source of truth for asset,
liability, valuation-date, and debt-cashflow fields. Dashboard history composes the two
tables by `couple_id` and month:

```text
monthly_cashflow_snapshots.month
  joins monthly_asset_snapshots.snapshot_month
  on couple_id + month
```

Existing historical cashflow snapshots are not backfilled in this release. For months
without an asset snapshot, the dashboard must render the existing R0 values and hide the
asset auto-valuation summary instead of inventing partial asset history.

## File Structure

Create:

```text
docs/research/2026-05-kiwoom-domestic-valuation-spike.md
app/api/cron/sync-daily-domestic-prices/route.ts
app/api/cron/sync-daily-domestic-prices/route.test.ts
app/api/cron/create-month-end-snapshots/route.ts
app/api/cron/create-month-end-snapshots/route.test.ts
src/lib/supabase/admin.ts
src/features/assets/types.ts
src/features/assets/lib/assetCalculations.ts
src/features/assets/lib/assetCalculations.test.ts
src/features/assets/lib/monthEndSnapshot.ts
src/features/assets/lib/monthEndSnapshot.test.ts
src/features/assets/lib/domesticValuationProvider.ts
src/features/assets/lib/domesticValuationProvider.test.ts
src/features/assets/lib/kiwoomDomesticValuationProvider.ts
src/features/assets/lib/kiwoomDomesticValuationProvider.test.ts
src/features/assets/actions/searchDomesticInstruments.ts
src/features/assets/actions/searchDomesticInstruments.test.ts
src/features/assets/actions/saveHolding.ts
src/features/assets/actions/saveHolding.test.ts
src/features/assets/actions/saveLiability.ts
src/features/assets/actions/saveLiability.test.ts
src/features/assets/components/InvestmentAssetPanel.tsx
src/features/assets/components/InvestmentAssetPanel.test.tsx
src/features/assets/components/LiabilityPanel.tsx
src/features/assets/components/LiabilityPanel.test.tsx
src/features/assets/jobs/syncDailyDomesticPrices.ts
src/features/assets/jobs/syncDailyDomesticPrices.test.ts
src/features/assets/jobs/createMonthEndSnapshots.ts
src/features/assets/jobs/createMonthEndSnapshots.test.ts
supabase/migrations/0006_asset_liability_valuation.sql
```

Modify:

```text
src/features/fire/types.ts
src/features/fire/lib/calculateFireProjection.ts
src/features/fire/lib/calculateFireProjection.test.ts
src/features/onboarding/actions/saveR0Snapshot.ts
src/features/onboarding/actions/saveR0Snapshot.test.ts
src/features/dashboard/components/R0Dashboard.tsx
src/features/dashboard/components/R0Dashboard.test.tsx
app/dashboard/page.tsx
src/lib/env.ts
```

## Task 0: Kiwoom Provider Spike

**Files:**

- Create: `docs/research/2026-05-kiwoom-domestic-valuation-spike.md`

- [x] **Step 1: Verify Kiwoom domestic ETF support**

Manual research must answer these concrete questions:

```markdown
# Kiwoom Domestic Valuation Spike

## Verdict

Use one of:

- PASS: Kiwoom supports domestic stocks, domestic ETFs, and Korean-listed US exposure ETFs well enough for Phase 2.
- FAIL: Kiwoom cannot support the required first release.
- CONDITIONAL: Kiwoom supports price lookup but requires a constraint listed below.

## Required Checks

- Domestic stock last close endpoint:
- Domestic ETF last close endpoint:
- Korean-listed US exposure ETF example checked:
- Instrument search or instrument master source:
- Auth method:
- Token lifetime:
- Server IP registration requirement:
- Rate limits:
- Pricing or usage cost:
- Weekend/holiday last trading-day behavior:

## Tested Symbols

| Symbol | Name | Expected Type | Result |
|---|---|---|---|
| 005930 | 삼성전자 | 국내주식 | |
| 360750 | TIGER 미국S&P500 | 국내 ETF | |
| 379810 | KODEX 미국나스닥100 | 국내 ETF | |

## Decision

Write exactly one decision:

- Proceed with `KiwoomDomesticValuationProvider`.
- Stop and evaluate Korea Investment Open API.
- Stop and evaluate a market-data provider.
```

- [x] **Step 2: Stop if spike is FAIL**

Do not implement `KiwoomDomesticValuationProvider` if the spike verdict is `FAIL`.

Expected result:

```text
Provider implementation waits until a viable domestic data source is confirmed.
```

Actual result:

```text
Verdict: CONDITIONAL
Decision: Proceed with provider boundary and non-live implementation.
Live Kiwoom calls remain gated on credentials, fixed outbound IP, rate limit,
pricing, and real-symbol verification.
```

- [x] **Step 3: Commit spike document**

Run:

```bash
git add docs/research/2026-05-kiwoom-domestic-valuation-spike.md
git commit -m "docs: research domestic valuation provider"
```

## Task 1: Pure Asset And Liability Calculations

**Files:**

- Create: `src/features/assets/types.ts`
- Create: `src/features/assets/lib/assetCalculations.ts`
- Create: `src/features/assets/lib/assetCalculations.test.ts`
- Modify: `src/features/fire/types.ts`
- Modify: `src/features/fire/lib/calculateFireProjection.ts`
- Modify: `src/features/fire/lib/calculateFireProjection.test.ts`
- Modify: `src/features/onboarding/actions/saveR0Snapshot.ts`
- Modify: `src/features/onboarding/actions/saveR0Snapshot.test.ts`

- [ ] **Step 1: Write failing calculation tests**

Add tests in `src/features/assets/lib/assetCalculations.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { calculateAssetSnapshotInputs } from "./assetCalculations";

describe("calculateAssetSnapshotInputs", () => {
  it("adds domestic auto valuation and other investments into investment assets", () => {
    const result = calculateAssetSnapshotInputs({
      cashAssetAmount: 10_000_000,
      domesticHoldingValuationAmount: 42_300_000,
      otherInvestmentAmount: 7_700_000,
      realEstateAssetAmount: 300_000_000,
      otherAssetAmount: 2_000_000,
      liabilities: [],
    });

    expect(result.investmentAssetAmount).toBe(50_000_000);
    expect(result.totalAssetAmount).toBe(362_000_000);
    expect(result.displayedNetWorth).toBe(362_000_000);
  });

  it("excludes residence-related liabilities from default FIRE net worth", () => {
    const result = calculateAssetSnapshotInputs({
      cashAssetAmount: 20_000_000,
      domesticHoldingValuationAmount: 50_000_000,
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
```

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
npm run test -- src/features/assets/lib/assetCalculations.test.ts
```

Expected: fail because `assetCalculations.ts` does not exist.

- [ ] **Step 3: Implement types and calculation**

Create `src/features/assets/types.ts`:

```ts
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
```

Create `src/features/assets/lib/assetCalculations.ts`:

```ts
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
    input.domesticHoldingValuationAmount + input.otherInvestmentAmount;
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
```

- [ ] **Step 4: Update FIRE projection input for debt cashflow**

Modify `src/features/fire/types.ts` so `FireProjectionInput` includes:

```ts
monthlyDebtInterestExpense: number;
monthlyDebtPrincipalPayment: number;
```

Modify `calculateFireProjection` so:

```ts
const monthlyLivingExpense =
  input.monthlyFixedExpense + input.monthlyVariableExpense + input.monthlyDebtInterestExpense;
const remainingCash =
  input.monthlyNetIncome -
  input.monthlyFixedExpense -
  input.monthlyVariableExpense -
  input.monthlyDebtInterestExpense -
  input.monthlyDebtPrincipalPayment -
  input.monthlyRegularInvestment;
const monthlyAssetGrowthCapacity =
  input.monthlyRegularInvestment + input.monthlyDebtPrincipalPayment + remainingCash;
```

Update existing tests by passing `monthlyDebtInterestExpense: 0` and `monthlyDebtPrincipalPayment: 0`, then add one test proving interest increases living expense and principal increases growth capacity.

- [ ] **Step 5: Update existing FIRE projection caller**

`calculateFireProjection` is currently called by `src/features/onboarding/actions/saveR0Snapshot.ts`.
Update that caller to pass zero debt values until asset/liability data is connected:

```ts
monthlyDebtInterestExpense: 0,
monthlyDebtPrincipalPayment: 0,
```

Update `src/features/onboarding/actions/saveR0Snapshot.test.ts` so the existing R0
onboarding path still saves a snapshot successfully after the `FireProjectionInput`
type changes.

- [ ] **Step 6: Run tests and verify GREEN**

Run:

```bash
npm run test -- src/features/assets/lib/assetCalculations.test.ts src/features/fire/lib/calculateFireProjection.test.ts src/features/onboarding/actions/saveR0Snapshot.test.ts
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/features/assets/types.ts src/features/assets/lib/assetCalculations.ts src/features/assets/lib/assetCalculations.test.ts src/features/fire/types.ts src/features/fire/lib/calculateFireProjection.ts src/features/fire/lib/calculateFireProjection.test.ts src/features/onboarding/actions/saveR0Snapshot.ts src/features/onboarding/actions/saveR0Snapshot.test.ts
git commit -m "feat: calculate asset liabilities for FIRE"
```

## Task 2: Database Model

**Files:**

- Create: `supabase/migrations/0006_asset_liability_valuation.sql`

- [ ] **Step 1: Create migration**

Create `supabase/migrations/0006_asset_liability_valuation.sql`:

```sql
create type public.asset_account_category as enum ('general', 'pension_savings', 'irp', 'other');
create type public.liability_purpose as enum ('residence', 'investment', 'lifestyle_credit', 'other');
create type public.instrument_market as enum ('KR');

create table public.asset_instruments (
  id uuid primary key default gen_random_uuid(),
  market public.instrument_market not null,
  symbol text not null,
  display_name text not null,
  instrument_type text not null check (instrument_type in ('stock', 'etf')),
  currency text not null default 'KRW',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (market, symbol)
);

create table public.asset_holdings (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  instrument_id uuid not null references public.asset_instruments(id),
  quantity numeric(20, 6) not null check (quantity > 0),
  account_category public.asset_account_category not null default 'general',
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.asset_liabilities (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  purpose public.liability_purpose not null,
  balance_amount numeric(14, 0) not null check (balance_amount >= 0),
  monthly_interest_amount numeric(14, 0) not null default 0 check (monthly_interest_amount >= 0),
  monthly_principal_amount numeric(14, 0) not null default 0 check (monthly_principal_amount >= 0),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.asset_price_snapshots (
  id uuid primary key default gen_random_uuid(),
  instrument_id uuid not null references public.asset_instruments(id) on delete cascade,
  valuation_date date not null,
  close_price numeric(14, 4) not null check (close_price >= 0),
  provider text not null,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (instrument_id, valuation_date, provider)
);

create table public.monthly_asset_snapshots (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  snapshot_month date not null,
  snapshot_date date not null,
  valuation_date date,
  cash_asset_amount numeric(14, 0) not null default 0,
  domestic_holding_valuation_amount numeric(14, 0) not null default 0,
  other_investment_amount numeric(14, 0) not null default 0,
  investment_asset_amount numeric(14, 0) not null default 0,
  real_estate_asset_amount numeric(14, 0) not null default 0,
  other_asset_amount numeric(14, 0) not null default 0,
  total_asset_amount numeric(14, 0) not null default 0,
  total_liability_amount numeric(14, 0) not null default 0,
  displayed_net_worth numeric(14, 0) not null,
  fire_calculation_net_worth numeric(14, 0) not null,
  monthly_debt_interest_amount numeric(14, 0) not null default 0,
  monthly_debt_principal_amount numeric(14, 0) not null default 0,
  created_at timestamptz not null default now(),
  unique (couple_id, snapshot_month)
);

create index asset_holdings_couple_id_idx on public.asset_holdings(couple_id);
create index asset_holdings_instrument_id_idx on public.asset_holdings(instrument_id);
create index asset_liabilities_couple_id_idx on public.asset_liabilities(couple_id);
create index asset_price_snapshots_instrument_date_idx
on public.asset_price_snapshots(instrument_id, valuation_date desc);
create index monthly_asset_snapshots_couple_month_idx
on public.monthly_asset_snapshots(couple_id, snapshot_month desc);

alter table public.asset_instruments enable row level security;
alter table public.asset_holdings enable row level security;
alter table public.asset_liabilities enable row level security;
alter table public.asset_price_snapshots enable row level security;
alter table public.monthly_asset_snapshots enable row level security;

create policy "members can read asset instruments"
on public.asset_instruments for select
using (true);

create policy "members can read asset holdings"
on public.asset_holdings for select
using (public.is_couple_member(couple_id));

create policy "admins can insert asset holdings"
on public.asset_holdings for insert
with check (created_by = auth.uid() and public.is_couple_admin(couple_id));

create policy "admins can update asset holdings"
on public.asset_holdings for update
using (public.is_couple_admin(couple_id))
with check (public.is_couple_admin(couple_id));

create policy "admins can delete asset holdings"
on public.asset_holdings for delete
using (public.is_couple_admin(couple_id));

create policy "members can read asset liabilities"
on public.asset_liabilities for select
using (public.is_couple_member(couple_id));

create policy "admins can insert asset liabilities"
on public.asset_liabilities for insert
with check (created_by = auth.uid() and public.is_couple_admin(couple_id));

create policy "admins can update asset liabilities"
on public.asset_liabilities for update
using (public.is_couple_admin(couple_id))
with check (public.is_couple_admin(couple_id));

create policy "admins can delete asset liabilities"
on public.asset_liabilities for delete
using (public.is_couple_admin(couple_id));

create policy "members can read asset price snapshots"
on public.asset_price_snapshots for select
using (true);

create policy "members can read monthly asset snapshots"
on public.monthly_asset_snapshots for select
using (public.is_couple_member(couple_id));
```

- [ ] **Step 2: Review migration for RLS gaps**

Run:

```bash
rg -n "enable row level security|create policy" supabase/migrations/0006_asset_liability_valuation.sql
```

Expected: every new table has RLS enabled and at least one read policy.

- [ ] **Step 3: Confirm write boundary for background jobs**

`asset_price_snapshots` and `monthly_asset_snapshots` are written only by scheduled
server code using a service-role Supabase client. Do not add browser/user insert or
update policies for these tables in the first release.

Add `src/lib/supabase/admin.ts` later in the scheduler phase, not in this migration
commit, unless tests require it earlier.

- [ ] **Step 4: Confirm relation to existing cashflow snapshots**

Document in this task's commit message or PR notes:

```text
monthly_cashflow_snapshots = income/expense/R0 projection source
monthly_asset_snapshots = asset/liability/valuation source
dashboard composes both by couple_id + month
no historical backfill in this release
```

- [ ] **Step 5: Commit**

Run:

```bash
git add supabase/migrations/0006_asset_liability_valuation.sql
git commit -m "feat: add asset liability valuation schema"
```

## Task 3: Month-End Snapshot Helpers

**Files:**

- Create: `src/features/assets/lib/monthEndSnapshot.ts`
- Create: `src/features/assets/lib/monthEndSnapshot.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/features/assets/lib/monthEndSnapshot.test.ts`:

```ts
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
```

- [ ] **Step 2: Run RED**

Run:

```bash
npm run test -- src/features/assets/lib/monthEndSnapshot.test.ts
```

Expected: fail because module does not exist.

- [ ] **Step 3: Implement helpers**

Create `src/features/assets/lib/monthEndSnapshot.ts`:

```ts
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function toKstParts(date: Date) {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  return {
    year: kst.getUTCFullYear(),
    monthIndex: kst.getUTCMonth(),
  };
}

export function getKstMonthEndDate(date: Date) {
  const { year, monthIndex } = toKstParts(date);
  const end = new Date(Date.UTC(year, monthIndex + 1, 0));
  return end.toISOString().slice(0, 10);
}

export function getSnapshotMonthDate(snapshotDate: string) {
  return `${snapshotDate.slice(0, 7)}-01`;
}
```

- [ ] **Step 4: Run GREEN**

Run:

```bash
npm run test -- src/features/assets/lib/monthEndSnapshot.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/features/assets/lib/monthEndSnapshot.ts src/features/assets/lib/monthEndSnapshot.test.ts
git commit -m "feat: add month-end snapshot helpers"
```

## Task 4: Domestic Valuation Provider Boundary

**Files:**

- Create: `src/features/assets/lib/domesticValuationProvider.ts`
- Create: `src/features/assets/lib/domesticValuationProvider.test.ts`
- Create: `src/features/assets/lib/kiwoomDomesticValuationProvider.ts`
- Create: `src/features/assets/lib/kiwoomDomesticValuationProvider.test.ts`
- Modify: `src/lib/env.ts`

- [ ] **Step 1: Write provider contract tests**

Create `src/features/assets/lib/domesticValuationProvider.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { normalizeDomesticInstrument } from "./domesticValuationProvider";

describe("normalizeDomesticInstrument", () => {
  it("normalizes domestic instrument fields", () => {
    expect(
      normalizeDomesticInstrument({
        symbol: "360750",
        displayName: "TIGER 미국S&P500",
        instrumentType: "etf",
      }),
    ).toEqual({
      market: "KR",
      symbol: "360750",
      displayName: "TIGER 미국S&P500",
      instrumentType: "etf",
      currency: "KRW",
    });
  });
});
```

- [ ] **Step 2: Implement provider contract**

Create `src/features/assets/lib/domesticValuationProvider.ts`:

```ts
export type DomesticInstrumentType = "stock" | "etf";

export type DomesticInstrument = {
  market: "KR";
  symbol: string;
  displayName: string;
  instrumentType: DomesticInstrumentType;
  currency: "KRW";
};

export type DomesticClosePrice = {
  symbol: string;
  valuationDate: string;
  closePrice: number;
  provider: string;
  fetchedAt: string;
};

export type DomesticValuationProvider = {
  searchInstruments(query: string): Promise<DomesticInstrument[]>;
  getLastClosePrice(symbol: string, asOfDate: string): Promise<DomesticClosePrice | null>;
};

export function normalizeDomesticInstrument(input: {
  symbol: string;
  displayName: string;
  instrumentType: DomesticInstrumentType;
}): DomesticInstrument {
  return {
    market: "KR",
    symbol: input.symbol,
    displayName: input.displayName,
    instrumentType: input.instrumentType,
    currency: "KRW",
  };
}
```

- [ ] **Step 3: Write Kiwoom env validation tests**

Create `src/features/assets/lib/kiwoomDomesticValuationProvider.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createKiwoomConfig } from "./kiwoomDomesticValuationProvider";

describe("createKiwoomConfig", () => {
  it("returns config when required values exist", () => {
    expect(
      createKiwoomConfig({
        KIWOOM_APP_KEY: "app-key",
        KIWOOM_APP_SECRET: "app-secret",
        KIWOOM_BASE_URL: "https://api.example.com",
      }),
    ).toEqual({
      appKey: "app-key",
      appSecret: "app-secret",
      baseUrl: "https://api.example.com",
    });
  });

  it("returns null when credentials are missing", () => {
    expect(createKiwoomConfig({})).toBeNull();
  });
});
```

- [ ] **Step 4: Implement Kiwoom config shell**

Create `src/features/assets/lib/kiwoomDomesticValuationProvider.ts`:

```ts
export type KiwoomConfig = {
  appKey: string;
  appSecret: string;
  baseUrl: string;
};

export function createKiwoomConfig(env: NodeJS.ProcessEnv): KiwoomConfig | null {
  if (!env.KIWOOM_APP_KEY || !env.KIWOOM_APP_SECRET || !env.KIWOOM_BASE_URL) {
    return null;
  }

  return {
    appKey: env.KIWOOM_APP_KEY,
    appSecret: env.KIWOOM_APP_SECRET,
    baseUrl: env.KIWOOM_BASE_URL,
  };
}
```

Do not implement live API calls until Task 0 has `PASS`.
For the current `CONDITIONAL` verdict, implement only the provider boundary, config
validation, fake provider tests, and live-call seams. Keep real Kiwoom network calls
behind a later credentials/IP/rate-limit verification task.

- [ ] **Step 5: Run tests**

Run:

```bash
npm run test -- src/features/assets/lib/domesticValuationProvider.test.ts src/features/assets/lib/kiwoomDomesticValuationProvider.test.ts
```

Expected: pass.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/features/assets/lib/domesticValuationProvider.ts src/features/assets/lib/domesticValuationProvider.test.ts src/features/assets/lib/kiwoomDomesticValuationProvider.ts src/features/assets/lib/kiwoomDomesticValuationProvider.test.ts
git commit -m "feat: add domestic valuation provider boundary"
```

## Task 5: Domestic Instrument Search Action

**Files:**

- Create: `src/features/assets/actions/searchDomesticInstruments.ts`
- Create: `src/features/assets/actions/searchDomesticInstruments.test.ts`

- [ ] **Step 1: Write search action tests**

Create tests that verify:

```ts
it("returns domestic stock and ETF results from the provider");
it("upserts searched domestic instruments into asset_instruments");
it("does not show US-listed tickers such as VOO as auto-valuation candidates");
it("returns a Korean error when the provider is unavailable");
```

Use a fake provider in tests. Do not call Kiwoom live.

- [ ] **Step 2: Implement search action/API boundary**

Implement a server action or route handler that:

- Requires an authenticated user.
- Accepts a plain text query.
- Calls `DomesticValuationProvider.searchInstruments(query)`.
- Normalizes symbols and names with `normalizeDomesticInstrument`.
- Upserts returned instruments into `asset_instruments` on `(market, symbol)`.
- Returns cached DB rows with `instrument_id` so `saveHolding` does not need to
  create instruments blindly.

If Kiwoom credentials are missing, return a recoverable Korean error:

```text
종목 검색을 준비 중이에요. 잠시 후 다시 시도해주세요.
```

- [ ] **Step 3: Run search action tests**

Run:

```bash
npm run test -- src/features/assets/actions/searchDomesticInstruments.test.ts
```

Expected: pass.

- [ ] **Step 4: Commit**

Run:

```bash
git add src/features/assets/actions/searchDomesticInstruments.ts src/features/assets/actions/searchDomesticInstruments.test.ts
git commit -m "feat: search domestic instruments"
```

## Task 6: Holding And Liability Server Actions

**Files:**

- Create: `src/features/assets/actions/saveHolding.ts`
- Create: `src/features/assets/actions/saveHolding.test.ts`
- Create: `src/features/assets/actions/saveLiability.ts`
- Create: `src/features/assets/actions/saveLiability.test.ts`

- [ ] **Step 1: Write action validation tests**

Create tests that verify:

```ts
expect(result).toEqual({ error: "보유 수량을 입력해주세요." });
expect(result).toEqual({ error: "부채 잔액을 입력해주세요." });
expect(mocks.createSupabaseServerClient).not.toHaveBeenCalled();
```

Use existing action test patterns from:

```text
src/features/onboarding/actions/saveR0Snapshot.test.ts
src/features/couple/actions/createInviteLink.test.ts
```

- [ ] **Step 2: Implement validation schemas**

Use Zod preprocessors matching `src/features/onboarding/lib/r0OnboardingSchema.ts`:

```ts
const quantityInput = z.coerce.number().positive("보유 수량을 입력해주세요.");
const requiredManwonInput = z.coerce.number().min(0, "0만원 이상으로 입력해주세요.");
```

For liability amounts, normalize 만원 input to KRW.

- [ ] **Step 3: Implement authenticated inserts**

`saveHolding` inserts:

```text
asset_holdings:
- couple_id
- instrument_id
- quantity
- account_category
- created_by
```

`saveLiability` inserts:

```text
asset_liabilities:
- couple_id
- purpose
- balance_amount
- monthly_interest_amount
- monthly_principal_amount
- created_by
```

Both actions must:

- Require authenticated user.
- Require admin membership.
- Require `instrument_id` from `searchDomesticInstruments`; do not accept free-form
  US ticker text in `saveHolding`.
- Return Korean error messages on validation/auth/persistence failure.
- Revalidate `/dashboard`.

If `instrument_id` is missing or does not reference an active KR instrument, return:

```text
종목 검색 결과에서 보유 종목을 선택해주세요.
```

- [ ] **Step 4: Run action tests**

Run:

```bash
npm run test -- src/features/assets/actions/saveHolding.test.ts src/features/assets/actions/saveLiability.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/features/assets/actions/saveHolding.ts src/features/assets/actions/saveHolding.test.ts src/features/assets/actions/saveLiability.ts src/features/assets/actions/saveLiability.test.ts
git commit -m "feat: save asset holdings and liabilities"
```

## Task 7: Investment And Liability UI Panels

**Files:**

- Create: `src/features/assets/components/InvestmentAssetPanel.tsx`
- Create: `src/features/assets/components/InvestmentAssetPanel.test.tsx`
- Create: `src/features/assets/components/LiabilityPanel.tsx`
- Create: `src/features/assets/components/LiabilityPanel.test.tsx`
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Write panel tests**

`InvestmentAssetPanel` tests:

```ts
expect(screen.getByText("투자자산")).toBeInTheDocument();
expect(screen.getByText("종목 검색")).toBeInTheDocument();
expect(screen.getByText("TIGER 미국S&P500")).toBeInTheDocument();
expect(screen.queryByText("VOO")).not.toBeInTheDocument();
```

`LiabilityPanel` tests:

```ts
expect(screen.getByText("부채")).toBeInTheDocument();
expect(screen.getByText(/이자는 비용으로 보고/)).toBeInTheDocument();
expect(screen.getByText(/원금상환은 빚이 줄어드는 효과/)).toBeInTheDocument();
```

- [ ] **Step 2: Implement panels**

Keep layout quiet and detail-screen oriented. Use existing UI primitives from `components/fire-banking`.

Investment copy:

```text
국내주식과 국내 ETF를 종목별로 자동 계산해요.
미국상장 ETF는 이번 버전에서 기타 투자자산으로 입력해요.
```

Liability copy:

```text
이자는 비용으로 보고,
원금상환은 빚이 줄어드는 효과로 계산해요.
```

- [ ] **Step 3: Add panels to dashboard area behind existing flow**

Add a dashboard section under existing R0 content or link to `자산/부채` detail if the route exists in the current branch. Do not create a separate stock menu.

- [ ] **Step 4: Run UI tests**

Run:

```bash
npm run test -- src/features/assets/components/InvestmentAssetPanel.test.tsx src/features/assets/components/LiabilityPanel.test.tsx
```

Expected: pass.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/features/assets/components/InvestmentAssetPanel.tsx src/features/assets/components/InvestmentAssetPanel.test.tsx src/features/assets/components/LiabilityPanel.tsx src/features/assets/components/LiabilityPanel.test.tsx app/dashboard/page.tsx
git commit -m "feat: add asset liability input panels"
```

## Task 8: Daily Price Sync Job

**Files:**

- Create: `src/features/assets/jobs/syncDailyDomesticPrices.ts`
- Create: `src/features/assets/jobs/syncDailyDomesticPrices.test.ts`

- [ ] **Step 1: Write sync tests**

Test behaviors:

```ts
it("stores close prices for active domestic holdings");
it("keeps the last stored price when provider returns null");
it("returns a warning count when provider throws");
```

- [ ] **Step 2: Implement sync function**

Function signature:

```ts
export async function syncDailyDomesticPrices({
  supabase,
  provider,
  asOfDate,
}: {
  supabase: SupabaseLike;
  provider: DomesticValuationProvider;
  asOfDate: string;
}): Promise<{ synced: number; skipped: number; failed: number }>;
```

Behavior:

- Query active instruments used by holdings.
- Fetch last close price for each symbol.
- Upsert into `asset_price_snapshots`.
- Count skipped when provider returns null.
- Count failed when provider throws and continue.

- [ ] **Step 3: Run tests**

Run:

```bash
npm run test -- src/features/assets/jobs/syncDailyDomesticPrices.test.ts
```

Expected: pass.

- [ ] **Step 4: Commit**

Run:

```bash
git add src/features/assets/jobs/syncDailyDomesticPrices.ts src/features/assets/jobs/syncDailyDomesticPrices.test.ts
git commit -m "feat: sync daily domestic prices"
```

## Task 9: Month-End Snapshot Job

**Files:**

- Create: `src/features/assets/jobs/createMonthEndSnapshots.ts`
- Create: `src/features/assets/jobs/createMonthEndSnapshots.test.ts`

- [ ] **Step 1: Write snapshot job tests**

Test behaviors:

```ts
it("creates one snapshot per couple and month");
it("uses couple_id plus snapshot_month as the idempotency key");
it("does not mutate prior month snapshots when current prices change");
it("excludes holdings without a month-end valuation and reports warnings");
```

- [ ] **Step 2: Implement snapshot job**

Function signature:

```ts
export async function createMonthEndSnapshots({
  supabase,
  snapshotDate,
}: {
  supabase: SupabaseLike;
  snapshotDate: string;
}): Promise<{ created: number; updated: number; warnings: string[] }>;
```

Behavior:

- Compute `snapshot_month` as first day of month.
- Load active couples with asset holdings or liabilities.
- Load latest price where `valuation_date <= snapshotDate`.
- Calculate asset/liability snapshot using `calculateAssetSnapshotInputs`.
- Upsert `monthly_asset_snapshots` on `couple_id,snapshot_month`.

- [ ] **Step 3: Run tests**

Run:

```bash
npm run test -- src/features/assets/jobs/createMonthEndSnapshots.test.ts
```

Expected: pass.

- [ ] **Step 4: Commit**

Run:

```bash
git add src/features/assets/jobs/createMonthEndSnapshots.ts src/features/assets/jobs/createMonthEndSnapshots.test.ts
git commit -m "feat: create month-end asset snapshots"
```

## Task 10: Scheduler Routes

**Files:**

- Create: `src/lib/supabase/admin.ts`
- Create: `app/api/cron/sync-daily-domestic-prices/route.ts`
- Create: `app/api/cron/sync-daily-domestic-prices/route.test.ts`
- Create: `app/api/cron/create-month-end-snapshots/route.ts`
- Create: `app/api/cron/create-month-end-snapshots/route.test.ts`
- Modify: `src/lib/env.ts`

- [ ] **Step 1: Implement service-role Supabase client**

Create `src/lib/supabase/admin.ts` using:

```text
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

This client is server-only and must never be imported by Client Components.

- [ ] **Step 2: Write cron route tests**

Test both cron routes:

```ts
it("rejects missing or invalid CRON_SECRET");
it("calls the underlying job when CRON_SECRET is valid");
it("returns JSON counts and warnings");
```

For the month-end route, also test:

```ts
it("exits without creating snapshots when today is not the KST month-end date");
```

- [ ] **Step 3: Implement protected route handlers**

Use protected Next.js route handlers:

```text
GET /api/cron/sync-daily-domestic-prices
GET /api/cron/create-month-end-snapshots
```

Both routes require:

```text
Authorization: Bearer ${CRON_SECRET}
```

Operational schedule:

```text
Daily price sync:
- Run once per day after provider has the latest close.
- Recommended schedule: every day 06:30 KST.

Month-end snapshot:
- Scheduler may call daily at 23:30 KST.
- Route exits unless the current Asia/Seoul date is the calendar month-end date.
- On KST month-end, run daily price sync first, then create snapshots.
```

This avoids relying on a cron expression that can directly express "last day of month"
on every hosting provider.

- [ ] **Step 4: Run route tests**

Run:

```bash
npm run test -- app/api/cron/sync-daily-domestic-prices/route.test.ts app/api/cron/create-month-end-snapshots/route.test.ts
```

Expected: pass.

- [ ] **Step 5: Commit**

Run:

```bash
git add src/lib/supabase/admin.ts app/api/cron/sync-daily-domestic-prices app/api/cron/create-month-end-snapshots src/lib/env.ts
git commit -m "feat: add asset valuation scheduler routes"
```

## Task 11: Dashboard History Integration

**Files:**

- Modify: `src/features/dashboard/components/R0Dashboard.tsx`
- Modify: `src/features/dashboard/components/R0Dashboard.test.tsx`
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Write dashboard tests**

Add tests proving:

```ts
expect(screen.getByText("현재 추정치")).toBeInTheDocument();
expect(screen.getByText("월말 스냅샷")).toBeInTheDocument();
expect(screen.getByText(/마지막 거래일/)).toBeInTheDocument();
expect(screen.getByText(/정기투자 \\+ 빚 감소 \\+ 남은 돈/)).toBeInTheDocument();
```

Also add regression tests proving:

```ts
it("renders existing R0 dashboard when asset snapshot summary is missing");
it("does not invent asset auto-valuation history for months before monthly_asset_snapshots exist");
```

- [ ] **Step 2: Update dashboard props and display**

Add optional asset snapshot summary prop:

```ts
type AssetSnapshotSummary = {
  mode: "current_estimate" | "fixed_month_end";
  snapshotMonth: string;
  snapshotDate: string | null;
  valuationDate: string | null;
  displayedNetWorth: number;
  fireCalculationNetWorth: number;
  investmentAssetAmount: number;
  totalLiabilityAmount: number;
  monthlyDebtPrincipalAmount: number;
};
```

Show quiet labels:

```text
현재 추정치
월말 스냅샷
자동평가 포함 · 마지막 거래일 YYYY-MM-DD 기준
정기투자 + 빚 감소 + 남은 돈
```

Dashboard data loading must compose:

```text
monthly_cashflow_snapshots.month
  + optional monthly_asset_snapshots.snapshot_month
```

If no matching `monthly_asset_snapshots` row exists, render the existing R0 dashboard
state and omit the auto-valuation summary.

- [ ] **Step 3: Run dashboard tests**

Run:

```bash
npm run test -- src/features/dashboard/components/R0Dashboard.test.tsx
```

Expected: pass.

- [ ] **Step 4: Commit**

Run:

```bash
git add src/features/dashboard/components/R0Dashboard.tsx src/features/dashboard/components/R0Dashboard.test.tsx app/dashboard/page.tsx
git commit -m "feat: show asset valuation snapshot summary"
```

## Final Verification

- [ ] **Step 1: Run unit and component tests**

Run:

```bash
npm run test
```

Expected: pass.

- [ ] **Step 2: Run lint**

Run:

```bash
npm run lint
```

Expected: pass.

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: pass.

- [ ] **Step 4: Review git diff**

Run:

```bash
git diff --stat main...HEAD
git status --short
```

Expected:

- Only intentional feature files are changed.
- Existing unrelated workspace changes are not reverted.

## Self-Review

Spec coverage:

- Domestic listed holdings: Tasks 2, 4, 5, 7.
- Search plus quantity input: Tasks 5, 6, 7.
- Pension/IRP account category: Tasks 2, 6, 7, 11.
- Liabilities and debt cashflow: Tasks 1, 2, 6, 7, 11.
- Daily price sync: Tasks 8, 10.
- Month-end automatic snapshots: Tasks 3, 9, 10.
- Dashboard history/current estimate distinction: Task 11.
- Provider spike before live API: Task 0.

Known sequencing guard:

- Do not implement live Kiwoom API calls while Task 0 is `CONDITIONAL`.
- The current approved path is provider boundary plus fake-provider-backed flows.
- Live Kiwoom calls require a follow-up verification task with App Key/App Secret,
  fixed outbound IP, rate limit, pricing, and real 005930/360750/379810 calls.
- If Task 0 later becomes `FAIL`, replace Task 4 provider implementation with the
  selected alternative and update this plan before proceeding.
