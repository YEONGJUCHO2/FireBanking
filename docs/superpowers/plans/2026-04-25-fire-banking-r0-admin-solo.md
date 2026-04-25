# Fire Banking R0 Internal Alpha + Invite Intent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build R0 Internal Alpha: a Next.js app where one lead partner can sign in with Google, enter Korean-context FIRE inputs, see a basic projection, persist a monthly snapshot, and generate/copy a spouse invite link as an intent signal. R0 is not the first external MVP; R0+R1 is the first meaningful couple-ritual validation unit.

**Architecture:** Use Next.js App Router with focused feature modules. Keep finance math in pure TypeScript functions under `src/features/fire/lib` so it can be tested without React or Supabase. Use Supabase for Google Auth and Postgres persistence, with RLS scoped through `couple_members`.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, Supabase Auth/Postgres, Zod, Vitest, Testing Library, Playwright.

---

## Scope

This plan implements only R0 from `docs/superpowers/specs/2026-04-25-fire-banking-mvp-design.md`.

R0 includes:

- Google OAuth login
- Lead-partner onboarding
- Total input fields for monthly income, investable net worth, optional primary residence net worth, optional other net worth, fixed expense, variable expense, and regular investment
- Basic FIRE calculation
- Basic dashboard
- Monthly snapshot persistence
- Spouse invite link generation, copy action, and invite status display as invite intent only

R0 excludes:

- Kakao OAuth
- Lite onboarding
- Lite check-in submission
- Request system
- Detailed fixed-cost CRUD
- Detailed household ledger
- Investment news feed
- AI analysis

Product validation boundary:

- R0 validates whether one lead partner can reach a trusted first FIRE result, understand the assumptions, persist the result after refresh, and take the first social step of generating/copying a spouse invite link.
- R0 does not validate the full couple ritual. Do not treat R0 success as proof that spouse participation, asymmetric UX, or monthly retention works. Those are R1-R3 questions.
- First external validation unit: R0+R1. R0 alone is an internal alpha for technical trust, input clarity, and invite intent.
- User-facing copy must not expose `admin` / `lite`. Those remain database roles only. UI copy should use neutral Korean language such as "리드 파트너", "배우자", "함께 보기", or the user's display names.
- R0 delivery is split into two execution slices:
  - R0a Core Alpha: Google OAuth, lead-partner onboarding, FIRE calculation, dashboard, and monthly snapshot persistence.
  - R0b Invite Intent: spouse invite link generation, copy action, invite status display, and preview route. This does not include spouse signup, spouse onboarding, or spouse input.

## Data Definitions

Use these definitions consistently in forms, schema, database columns, dashboard labels, and tests:

- `monthlyNetIncome`: household after-tax monthly income. In R0, the lead partner can enter the household estimate.
- `investableNetWorth`: cash, deposits, brokerage assets, retirement accounts that the household considers part of FIRE assets. R0 FIRE projection uses this value.
- `primaryResidenceNetWorth`: owned home market value minus home-secured debt. Displayed for context, excluded from R0 FIRE projection by default. Optional in R0; blank input is stored as 0.
- `otherNetWorth`: cars, deposits that are not planned FIRE assets, or uncertain assets. Displayed for context, excluded from R0 FIRE projection by default. Optional in R0; blank input is stored as 0.
- `monthlyFixedExpense`: household-level recurring fixed costs, such as housing, insurance, telecom, subscriptions.
- `monthlyVariableExpense`: expected normal-month variable spending, not last month's exact ledger. R0 copy must say "평소 한 달 기준 예상 변동비".
- `monthlyRegularInvestment`: recurring savings/investments that increase investable assets.
- `monthlyAssetGrowthCapacity`: `monthlyRegularInvestment + remainingCash`; R0 does not include unrealized housing appreciation.

Input UX rule:

- R0 money inputs use 만원 units in the UI to reduce typing burden. The schema normalizes 만원 input values to KRW integers before calculation and persistence.
- Investable net worth is required because it drives the R0 FIRE projection.
- Primary residence net worth and other net worth are optional context fields. The form copy must say "없거나 모르겠으면 비워도 괜찮아요.".
- Onboarding copy must reassure the user: "정확하지 않아도 괜찮아요. 지금은 첫 거리감을 보는 단계예요."

Result-screen assumptions:

- R0 uses annual return 5% and 25x annual living expense as a default simulation.
- R0 must show that primary residence, pension timing, taxes, inflation, and withdrawal sequencing are simplified or not reflected.
- R0 must show a short disclaimer: "참고용 시뮬레이션이며 투자 자문이 아닙니다."

## File Structure

Create this app structure:

```text
app/
  layout.tsx
  page.tsx
  globals.css
  auth/callback/route.ts
  dashboard/page.tsx
  invite/[token]/page.tsx
  onboarding/page.tsx
proxy.ts
src/
  features/
    auth/
      components/SignInButton.tsx
      lib/getCurrentUser.ts
    onboarding/
      actions/saveR0Snapshot.ts
      components/R0OnboardingForm.tsx
      lib/r0OnboardingSchema.ts
      lib/r0OnboardingSchema.test.ts
    couple/
      actions/createInviteLink.ts
      components/InvitePartnerCard.tsx
      components/InvitePartnerCard.test.tsx
      lib/inviteToken.ts
    fire/
      lib/calculateFireProjection.ts
      lib/calculateFireProjection.test.ts
      types.ts
    dashboard/
      components/R0Dashboard.tsx
  lib/
    env.ts
    format.ts
    supabase/browser.ts
    supabase/proxy.ts
    supabase/server.ts
supabase/
  migrations/0001_r0_admin_solo.sql
tests/
  e2e/r0-admin-solo.spec.ts
```

Responsibilities:

- `src/features/fire/lib/calculateFireProjection.ts`: pure financial calculations.
- `src/features/onboarding/lib/r0OnboardingSchema.ts`: form validation and input normalization.
- `src/features/onboarding/actions/saveR0Snapshot.ts`: authenticated persistence into Supabase.
- `src/features/couple/actions/createInviteLink.ts`: authenticated spouse invite link creation.
- `src/features/couple/components/InvitePartnerCard.tsx`: invite link display and copy action on dashboard.
- `src/features/dashboard/components/R0Dashboard.tsx`: display persisted snapshot and projection.
- `src/lib/supabase/*`: Supabase client creation only.
- `supabase/migrations/0001_r0_admin_solo.sql`: R0 schema and RLS policies.

---

### Task 1: Scaffold Next.js App

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `eslint.config.mjs`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`
- Create: `.env.example`
- Create: `.gitignore`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "fire-banking",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@supabase/ssr": "^0.6.0",
    "@supabase/supabase-js": "^2.0.0",
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.0.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/react": "^16.0.0",
    "@types/node": "^24.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^16.0.0",
    "jsdom": "^26.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.0.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

- [ ] **Step 4: Create `eslint.config.mjs`**

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
```

- [ ] **Step 5: Create `postcss.config.mjs`**

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

- [ ] **Step 6: Create `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
};

export default config;
```

- [ ] **Step 7: Create `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fire Banking",
  description: "월 1회 부부가 함께 FIRE 진척을 확인하는 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 8: Create `app/page.tsx`**

```tsx
export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-slate-950">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <p className="text-sm font-medium text-emerald-700">월 1회 3분</p>
        <h1 className="text-4xl font-bold tracking-normal">
          부부가 함께 순자산과 경제적 자유 진척을 확인하는 앱
        </h1>
      </div>
    </main>
  );
}
```

- [ ] **Step 9: Create `app/globals.css`**

```css
@import "tailwindcss";

:root {
  color-scheme: light;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #fafaf9;
}
```

- [ ] **Step 10: Create `.gitignore`**

```gitignore
.DS_Store
.env
.env.local
.next
node_modules
playwright-report
test-results
```

- [ ] **Step 11: Create `.env.example`**

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

- [ ] **Step 12: Install dependencies**

Run:

```bash
npm install
```

Expected:

```text
added
```

- [ ] **Step 13: Verify app starts**

Run:

```bash
npm run dev
```

Expected:

```text
Local: http://localhost:3000
```

Stop the server after the check.

- [ ] **Step 14: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts eslint.config.mjs postcss.config.mjs tailwind.config.ts app .env.example .gitignore
git commit -m "chore: scaffold r0 next app"
```

Expected:

```text
[main
```

If this directory is not a git repository, skip the commit and record that in the task notes.

---

### Task 2: Add Test Configuration

**Files:**
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Modify: `package.json`

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
});
```

- [ ] **Step 2: Create `src/test/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Update `package.json` scripts**

Ensure the `scripts` object contains:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test"
}
```

- [ ] **Step 4: Verify test runner**

Run:

```bash
npm run test
```

Expected:

```text
No test files found
```

- [ ] **Step 5: Commit**

```bash
git add package.json vitest.config.ts src/test/setup.ts
git commit -m "test: configure vitest"
```

Expected:

```text
[main
```

If this directory is not a git repository, skip the commit and record that in the task notes.

---

### Task 3: Implement FIRE Calculation Engine

**Files:**
- Create: `src/features/fire/types.ts`
- Create: `src/features/fire/lib/calculateFireProjection.test.ts`
- Create: `src/features/fire/lib/calculateFireProjection.ts`

- [ ] **Step 1: Create `src/features/fire/types.ts`**

```ts
export type FireProjectionInput = {
  investableNetWorth: number;
  primaryResidenceNetWorth: number;
  otherNetWorth: number;
  monthlyNetIncome: number;
  monthlyFixedExpense: number;
  monthlyVariableExpense: number;
  monthlyRegularInvestment: number;
  annualReturnRate: number;
  fireMultiplier: number;
  startDate: Date;
};

export type FireProjectionResult = {
  totalNetWorthForDisplay: number;
  fireCalculationNetWorth: number;
  monthlyLivingExpense: number;
  annualLivingExpense: number;
  fireTargetAsset: number;
  remainingAmount: number;
  remainingCash: number;
  monthlyAssetGrowthCapacity: number;
  projectedFireDate: Date | null;
  monthsToFire: number | null;
};
```

- [ ] **Step 2: Write failing calculation tests**

Create `src/features/fire/lib/calculateFireProjection.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { calculateFireProjection } from "./calculateFireProjection";

describe("calculateFireProjection", () => {
  it("calculates target asset and monthly growth capacity from total inputs", () => {
    const result = calculateFireProjection({
      investableNetWorth: 120_000_000,
      primaryResidenceNetWorth: 700_000_000,
      otherNetWorth: 20_000_000,
      monthlyNetIncome: 7_200_000,
      monthlyFixedExpense: 2_300_000,
      monthlyVariableExpense: 1_700_000,
      monthlyRegularInvestment: 2_000_000,
      annualReturnRate: 0.05,
      fireMultiplier: 25,
      startDate: new Date("2026-04-01T00:00:00.000Z"),
    });

    expect(result.totalNetWorthForDisplay).toBe(840_000_000);
    expect(result.fireCalculationNetWorth).toBe(120_000_000);
    expect(result.monthlyLivingExpense).toBe(4_000_000);
    expect(result.annualLivingExpense).toBe(48_000_000);
    expect(result.fireTargetAsset).toBe(1_200_000_000);
    expect(result.remainingCash).toBe(1_200_000);
    expect(result.monthlyAssetGrowthCapacity).toBe(3_200_000);
    expect(result.projectedFireDate).toBeInstanceOf(Date);
    expect(result.monthsToFire).toBeGreaterThan(0);
  });

  it("returns no projected date when growth is impossible and target is not reached", () => {
    const result = calculateFireProjection({
      investableNetWorth: 10_000_000,
      primaryResidenceNetWorth: 500_000_000,
      otherNetWorth: 0,
      monthlyNetIncome: 3_000_000,
      monthlyFixedExpense: 2_000_000,
      monthlyVariableExpense: 1_500_000,
      monthlyRegularInvestment: 0,
      annualReturnRate: 0.05,
      fireMultiplier: 25,
      startDate: new Date("2026-04-01T00:00:00.000Z"),
    });

    expect(result.monthlyAssetGrowthCapacity).toBe(-500_000);
    expect(result.projectedFireDate).toBeNull();
    expect(result.monthsToFire).toBeNull();
  });

  it("returns the start month when current net worth already reaches target", () => {
    const startDate = new Date("2026-04-01T00:00:00.000Z");
    const result = calculateFireProjection({
      investableNetWorth: 1_300_000_000,
      primaryResidenceNetWorth: 0,
      otherNetWorth: 0,
      monthlyNetIncome: 7_200_000,
      monthlyFixedExpense: 2_300_000,
      monthlyVariableExpense: 1_700_000,
      monthlyRegularInvestment: 2_000_000,
      annualReturnRate: 0.05,
      fireMultiplier: 25,
      startDate,
    });

    expect(result.projectedFireDate?.toISOString()).toBe(startDate.toISOString());
    expect(result.monthsToFire).toBe(0);
  });
});
```

- [ ] **Step 3: Run test to verify failure**

Run:

```bash
npm run test -- src/features/fire/lib/calculateFireProjection.test.ts
```

Expected:

```text
Cannot find module './calculateFireProjection'
```

- [ ] **Step 4: Implement `src/features/fire/lib/calculateFireProjection.ts`**

```ts
import type { FireProjectionInput, FireProjectionResult } from "../types";

const MAX_SIMULATION_MONTHS = 12 * 100;

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
}

export function calculateFireProjection(input: FireProjectionInput): FireProjectionResult {
  const totalNetWorthForDisplay =
    input.investableNetWorth + input.primaryResidenceNetWorth + input.otherNetWorth;
  const fireCalculationNetWorth = input.investableNetWorth;
  const monthlyLivingExpense = input.monthlyFixedExpense + input.monthlyVariableExpense;
  const annualLivingExpense = monthlyLivingExpense * 12;
  const fireTargetAsset = annualLivingExpense * input.fireMultiplier;
  const remainingAmount = Math.max(fireTargetAsset - fireCalculationNetWorth, 0);
  const remainingCash =
    input.monthlyNetIncome -
    input.monthlyFixedExpense -
    input.monthlyVariableExpense -
    input.monthlyRegularInvestment;
  const monthlyAssetGrowthCapacity = input.monthlyRegularInvestment + remainingCash;

  if (fireCalculationNetWorth >= fireTargetAsset) {
    return {
      totalNetWorthForDisplay,
      fireCalculationNetWorth,
      monthlyLivingExpense,
      annualLivingExpense,
      fireTargetAsset,
      remainingAmount,
      remainingCash,
      monthlyAssetGrowthCapacity,
      projectedFireDate: input.startDate,
      monthsToFire: 0,
    };
  }

  if (monthlyAssetGrowthCapacity <= 0) {
    return {
      totalNetWorthForDisplay,
      fireCalculationNetWorth,
      monthlyLivingExpense,
      annualLivingExpense,
      fireTargetAsset,
      remainingAmount,
      remainingCash,
      monthlyAssetGrowthCapacity,
      projectedFireDate: null,
      monthsToFire: null,
    };
  }

  const monthlyReturnRate = Math.pow(1 + input.annualReturnRate, 1 / 12) - 1;
  let simulatedNetWorth = fireCalculationNetWorth;

  for (let month = 1; month <= MAX_SIMULATION_MONTHS; month += 1) {
    simulatedNetWorth = simulatedNetWorth * (1 + monthlyReturnRate) + monthlyAssetGrowthCapacity;

    if (simulatedNetWorth >= fireTargetAsset) {
      return {
        totalNetWorthForDisplay,
        fireCalculationNetWorth,
        monthlyLivingExpense,
        annualLivingExpense,
        fireTargetAsset,
        remainingAmount,
        remainingCash,
        monthlyAssetGrowthCapacity,
        projectedFireDate: addMonths(input.startDate, month),
        monthsToFire: month,
      };
    }
  }

  return {
    totalNetWorthForDisplay,
    fireCalculationNetWorth,
    monthlyLivingExpense,
    annualLivingExpense,
    fireTargetAsset,
    remainingAmount,
    remainingCash,
    monthlyAssetGrowthCapacity,
    projectedFireDate: null,
    monthsToFire: null,
  };
}
```

- [ ] **Step 5: Run test to verify pass**

Run:

```bash
npm run test -- src/features/fire/lib/calculateFireProjection.test.ts
```

Expected:

```text
3 passed
```

- [ ] **Step 6: Commit**

```bash
git add src/features/fire
git commit -m "feat: add r0 fire projection engine"
```

Expected:

```text
[main
```

If this directory is not a git repository, skip the commit and record that in the task notes.

---

### Task 4: Add Formatting and Environment Helpers

**Files:**
- Create: `src/lib/format.ts`
- Create: `src/lib/env.ts`

- [ ] **Step 1: Create `src/lib/format.ts`**

```ts
export function formatKrw(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMonth(date: Date | string | null) {
  if (!date) {
    return "계산 불가";
  }

  const parsed = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
  }).format(parsed);
}
```

- [ ] **Step 2: Create `src/lib/env.ts`**

```ts
export function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
```

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected:

```text
No ESLint warnings or errors
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/format.ts src/lib/env.ts
git commit -m "feat: add r0 utility helpers"
```

Expected:

```text
[main
```

If this directory is not a git repository, skip the commit and record that in the task notes.

---

### Task 5: Add Supabase Schema and Clients

**Files:**
- Create: `supabase/migrations/0001_r0_admin_solo.sql`
- Create: `src/lib/supabase/browser.ts`
- Create: `src/lib/supabase/proxy.ts`
- Create: `src/lib/supabase/server.ts`

- [ ] **Step 1: Create `supabase/migrations/0001_r0_admin_solo.sql`**

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.couples (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create type public.couple_role as enum ('admin', 'lite');

create table public.couple_members (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.couple_role not null,
  joined_at timestamptz not null default now(),
  unique (couple_id, user_id)
);

create table public.couple_invites (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  token text not null unique,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  expires_at timestamptz not null default (now() + interval '14 days'),
  accepted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.monthly_cashflow_snapshots (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  month date not null,
  total_income numeric(14, 0) not null,
  investable_net_worth numeric(14, 0) not null,
  primary_residence_net_worth numeric(14, 0) not null,
  other_net_worth numeric(14, 0) not null,
  total_net_worth_for_display numeric(14, 0) not null,
  fire_calculation_net_worth numeric(14, 0) not null,
  fixed_expense numeric(14, 0) not null,
  variable_expense numeric(14, 0) not null,
  regular_investment numeric(14, 0) not null,
  remaining_cash numeric(14, 0) not null,
  monthly_asset_growth_capacity numeric(14, 0) not null,
  annual_fire_expense numeric(14, 0) not null,
  fire_target_asset numeric(14, 0) not null,
  projected_fire_date date,
  created_at timestamptz not null default now(),
  unique (couple_id, month)
);

alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.couple_invites enable row level security;
alter table public.monthly_cashflow_snapshots enable row level security;

create or replace function public.is_couple_member(target_couple_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.couple_members
    where couple_members.couple_id = target_couple_id
    and couple_members.user_id = auth.uid()
  );
$$;

create or replace function public.is_couple_admin(target_couple_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.couple_members
    where couple_members.couple_id = target_couple_id
    and couple_members.user_id = auth.uid()
    and couple_members.role = 'admin'
  );
$$;

create policy "profiles are readable by self"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles are insertable by self"
on public.profiles for insert
with check (auth.uid() = id);

create policy "profiles are updatable by self"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "members can read own couples"
on public.couples for select
using (public.is_couple_member(id));

create policy "authenticated users can create couples"
on public.couples for insert
with check (auth.uid() is not null);

create policy "members can read memberships"
on public.couple_members for select
using (public.is_couple_member(couple_id));

create policy "authenticated users can create own admin membership"
on public.couple_members for insert
with check (auth.uid() = user_id and role = 'admin');

create policy "admins can read couple invites"
on public.couple_invites for select
using (public.is_couple_admin(couple_id));

create policy "admins can insert couple invites"
on public.couple_invites for insert
with check (created_by = auth.uid() and public.is_couple_admin(couple_id));

create policy "admins can update couple invites"
on public.couple_invites for update
using (public.is_couple_admin(couple_id))
with check (public.is_couple_admin(couple_id));

create policy "members can read monthly snapshots"
on public.monthly_cashflow_snapshots for select
using (public.is_couple_member(couple_id));

create policy "admins can insert monthly snapshots"
on public.monthly_cashflow_snapshots for insert
with check (created_by = auth.uid() and public.is_couple_admin(couple_id));

create policy "admins can update monthly snapshots"
on public.monthly_cashflow_snapshots for update
using (public.is_couple_admin(couple_id))
with check (public.is_couple_admin(couple_id));
```

- [ ] **Step 2: Create `src/lib/supabase/browser.ts`**

```ts
import { createBrowserClient } from "@supabase/ssr";
import { getRequiredEnv } from "@/src/lib/env";

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
  );
}
```

- [ ] **Step 3: Create `src/lib/supabase/server.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getRequiredEnv } from "@/src/lib/env";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // Server Components cannot set cookies. `proxy.ts` refreshes sessions.
            }
          });
        },
      },
    },
  );
}
```

- [ ] **Step 4: Create `src/lib/supabase/proxy.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getRequiredEnv } from "@/src/lib/env";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  await supabase.auth.getClaims();

  return response;
}
```

- [ ] **Step 5: Create root `proxy.ts`**

```ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/src/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

- [ ] **Step 6: Apply the migration in Supabase**

Run this only after the Supabase CLI is configured for the project:

```bash
npx supabase db push
```

Expected:

```text
Finished supabase db push.
```

- [ ] **Step 7: Commit**

```bash
git add proxy.ts supabase/migrations/0001_r0_admin_solo.sql src/lib/supabase
git commit -m "feat: add r0 supabase schema"
```

Expected:

```text
[main
```

If this directory is not a git repository, skip the commit and record that in the task notes.

---

### Task 6: Implement Google Auth Entry and Callback

**Files:**
- Create: `src/features/auth/components/SignInButton.tsx`
- Create: `src/features/auth/lib/getCurrentUser.ts`
- Create: `app/auth/callback/route.ts`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `src/features/auth/components/SignInButton.tsx`**

```tsx
"use client";

import { createSupabaseBrowserClient } from "@/src/lib/supabase/browser";

export function SignInButton() {
  async function signInWithGoogle() {
    const supabase = createSupabaseBrowserClient();
    const origin = window.location.origin;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
  }

  return (
    <button
      type="button"
      onClick={signInWithGoogle}
      className="rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
    >
      Google로 시작하기
    </button>
  );
}
```

- [ ] **Step 2: Create `src/features/auth/lib/getCurrentUser.ts`**

```ts
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
```

- [ ] **Step 3: Create `app/auth/callback/route.ts`**

```ts
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/?error=auth_callback_missing_code", request.url));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/?error=auth_callback_failed", request.url));
  }

  return NextResponse.redirect(new URL("/onboarding", request.url));
}
```

- [ ] **Step 4: Replace `app/page.tsx`**

```tsx
import { SignInButton } from "@/src/features/auth/components/SignInButton";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-slate-950">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <section className="flex flex-col gap-4">
          <p className="text-sm font-medium text-emerald-700">월 1회 3분</p>
          <h1 className="text-4xl font-bold tracking-normal">
            부부가 함께 순자산과 경제적 자유 진척을 확인하는 앱
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-700">
            R0에서는 먼저 혼자 총액을 입력하고 기본 FIRE 결과를 확인한 뒤, 배우자에게 공유할 링크를
            만들 수 있습니다. 배우자의 가입과 Lite 체크인은 다음 릴리즈에서 붙입니다.
          </p>
        </section>
        <SignInButton />
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Run lint**

Run:

```bash
npm run lint
```

Expected:

```text
No ESLint warnings or errors
```

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/auth/callback/route.ts src/features/auth
git commit -m "feat: add google auth entry"
```

Expected:

```text
[main
```

If this directory is not a git repository, skip the commit and record that in the task notes.

---

### Task 7: Implement R0 Onboarding Validation

**Files:**
- Create: `src/features/onboarding/lib/r0OnboardingSchema.test.ts`
- Create: `src/features/onboarding/lib/r0OnboardingSchema.ts`

- [ ] **Step 1: Write failing schema tests**

Create `src/features/onboarding/lib/r0OnboardingSchema.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify failure**

Run:

```bash
npm run test -- src/features/onboarding/lib/r0OnboardingSchema.test.ts
```

Expected:

```text
Cannot find module './r0OnboardingSchema'
```

- [ ] **Step 3: Implement `src/features/onboarding/lib/r0OnboardingSchema.ts`**

```ts
import { z } from "zod";

const stripCommaString = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  return value.replaceAll(",", "").trim();
};

const requiredManwonInput = z.preprocess(
  (value) => {
    const normalized = stripCommaString(value);
    return normalized === "" || normalized === null || normalized === undefined ? undefined : normalized;
  },
  z.coerce
    .number({
      invalid_type_error: "숫자로 입력해주세요.",
    })
    .int("만원 단위 정수로 입력해주세요.")
    .min(0, "0만원 이상으로 입력해주세요.")
    .transform((value) => value * 10_000),
);

const optionalManwonInput = z.preprocess((value) => {
  const normalized = stripCommaString(value);
  return normalized === "" || normalized === null || normalized === undefined ? 0 : normalized;
}, requiredManwonInput);

export const r0OnboardingSchema = z.object({
  monthlyNetIncome: requiredManwonInput,
  investableNetWorth: requiredManwonInput,
  primaryResidenceNetWorth: optionalManwonInput,
  otherNetWorth: optionalManwonInput,
  monthlyFixedExpense: requiredManwonInput,
  monthlyVariableExpense: requiredManwonInput,
  monthlyRegularInvestment: requiredManwonInput,
});

export type R0OnboardingInput = z.infer<typeof r0OnboardingSchema>;
```

- [ ] **Step 4: Run test to verify pass**

Run:

```bash
npm run test -- src/features/onboarding/lib/r0OnboardingSchema.test.ts
```

Expected:

```text
4 passed
```

- [ ] **Step 5: Commit**

```bash
git add src/features/onboarding/lib
git commit -m "feat: add r0 onboarding validation"
```

Expected:

```text
[main
```

If this directory is not a git repository, skip the commit and record that in the task notes.

---

### Task 8: Implement Snapshot Save Action

**Files:**
- Create: `src/features/onboarding/actions/saveR0Snapshot.ts`
- Create: `src/features/onboarding/actions/saveR0Snapshot.test.ts`

- [ ] **Step 1: Create `src/features/onboarding/actions/saveR0Snapshot.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { calculateFireProjection } from "@/src/features/fire/lib/calculateFireProjection";
import { r0OnboardingSchema } from "@/src/features/onboarding/lib/r0OnboardingSchema";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

function currentMonthDate() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

export type SaveR0SnapshotState = {
  error?: string;
};

export async function saveR0Snapshot(
  _state: SaveR0SnapshotState,
  formData: FormData,
): Promise<SaveR0SnapshotState> {
  const parsed = r0OnboardingSchema.safeParse({
    monthlyNetIncome: formData.get("monthlyNetIncome"),
    investableNetWorth: formData.get("investableNetWorth"),
    primaryResidenceNetWorth: formData.get("primaryResidenceNetWorth"),
    otherNetWorth: formData.get("otherNetWorth"),
    monthlyFixedExpense: formData.get("monthlyFixedExpense"),
    monthlyVariableExpense: formData.get("monthlyVariableExpense"),
    monthlyRegularInvestment: formData.get("monthlyRegularInvestment"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const displayName = user.user_metadata.full_name ?? user.email ?? "리드 파트너";

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    display_name: displayName,
  });

  if (profileError) {
    return { error: "프로필을 저장하지 못했습니다." };
  }

  const { data: existingMembership, error: membershipLookupError } = await supabase
    .from("couple_members")
    .select("couple_id")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipLookupError) {
    return { error: "워크스페이스 정보를 불러오지 못했습니다." };
  }

  let coupleId = existingMembership?.couple_id as string | undefined;

  if (!coupleId) {
    const { data: couple, error: coupleError } = await supabase
      .from("couples")
      .insert({ name: `${displayName}님의 FIRE 워크스페이스` })
      .select("id")
      .single();

    if (coupleError || !couple) {
      return { error: "워크스페이스를 만들지 못했습니다." };
    }

    coupleId = couple.id;

    const { error: memberError } = await supabase.from("couple_members").insert({
      couple_id: coupleId,
      user_id: user.id,
      role: "admin",
    });

    if (memberError) {
      const { data: recoveredMembership } = await supabase
        .from("couple_members")
        .select("couple_id")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .order("joined_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!recoveredMembership) {
        return { error: "리드 파트너 역할을 저장하지 못했습니다." };
      }

      coupleId = recoveredMembership.couple_id;
    }
  }

  const month = currentMonthDate();
  const projection = calculateFireProjection({
    investableNetWorth: parsed.data.investableNetWorth,
    primaryResidenceNetWorth: parsed.data.primaryResidenceNetWorth,
    otherNetWorth: parsed.data.otherNetWorth,
    monthlyNetIncome: parsed.data.monthlyNetIncome,
    monthlyFixedExpense: parsed.data.monthlyFixedExpense,
    monthlyVariableExpense: parsed.data.monthlyVariableExpense,
    monthlyRegularInvestment: parsed.data.monthlyRegularInvestment,
    annualReturnRate: 0.05,
    fireMultiplier: 25,
    startDate: new Date(month),
  });

  const { error: snapshotError } = await supabase.from("monthly_cashflow_snapshots").upsert(
    {
      couple_id: coupleId,
      created_by: user.id,
      month,
      total_income: parsed.data.monthlyNetIncome,
      investable_net_worth: parsed.data.investableNetWorth,
      primary_residence_net_worth: parsed.data.primaryResidenceNetWorth,
      other_net_worth: parsed.data.otherNetWorth,
      total_net_worth_for_display: projection.totalNetWorthForDisplay,
      fire_calculation_net_worth: projection.fireCalculationNetWorth,
      fixed_expense: parsed.data.monthlyFixedExpense,
      variable_expense: parsed.data.monthlyVariableExpense,
      regular_investment: parsed.data.monthlyRegularInvestment,
      remaining_cash: projection.remainingCash,
      monthly_asset_growth_capacity: projection.monthlyAssetGrowthCapacity,
      annual_fire_expense: projection.annualLivingExpense,
      fire_target_asset: projection.fireTargetAsset,
      projected_fire_date: projection.projectedFireDate
        ? projection.projectedFireDate.toISOString().slice(0, 10)
        : null,
    },
    { onConflict: "couple_id,month" },
  );

  if (snapshotError) {
    return { error: "이번 달 스냅샷을 저장하지 못했습니다." };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
```

- [ ] **Step 2: Add server action tests**

Create `src/features/onboarding/actions/saveR0Snapshot.test.ts`.

Test these branches with mocked `createSupabaseServerClient`, `redirect`, and `revalidatePath`:

- Invalid form data returns the first Zod validation message and does not call Supabase.
- Missing authenticated user returns `"로그인이 필요합니다."`.
- Profile upsert failure returns `"프로필을 저장하지 못했습니다."`.
- Existing membership path writes one monthly snapshot with calculated FIRE fields.
- New membership path creates a couple, creates a lead-partner membership, then writes the snapshot.
- Membership insert race recovers an existing membership and still writes the snapshot.
- Snapshot upsert failure returns `"이번 달 스냅샷을 저장하지 못했습니다."`.

- [ ] **Step 3: Run action tests**

Run:

```bash
npm run test -- src/features/onboarding/actions/saveR0Snapshot.test.ts
```

Expected:

```text
7 passed
```

- [ ] **Step 4: Run lint**

Run:

```bash
npm run lint
```

Expected:

```text
No ESLint warnings or errors
```

- [ ] **Step 5: Commit**

```bash
git add src/features/onboarding/actions/saveR0Snapshot.ts src/features/onboarding/actions/saveR0Snapshot.test.ts
git commit -m "feat: save r0 monthly snapshot"
```

Expected:

```text
[main
```

If this directory is not a git repository, skip the commit and record that in the task notes.

---

### Task 9: Build R0 Onboarding Page

**Files:**
- Create: `src/features/onboarding/components/R0OnboardingForm.tsx`
- Create: `app/onboarding/page.tsx`

- [ ] **Step 1: Create `src/features/onboarding/components/R0OnboardingForm.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import { saveR0Snapshot, type SaveR0SnapshotState } from "@/src/features/onboarding/actions/saveR0Snapshot";

const initialState: SaveR0SnapshotState = {};

const fields = [
  ["monthlyNetIncome", "가구 세후 월수입", "720", "만원 단위로 입력합니다. 보너스가 있다면 평소 한 달 기준으로 대략 입력하세요.", true],
  ["investableNetWorth", "투자가능 순자산", "12000", "만원 단위입니다. 예금, 주식, ETF, 연금저축 등 FIRE 계산에 넣을 자산입니다.", true],
  ["primaryResidenceNetWorth", "거주 부동산 순자산", "70000", "만원 단위입니다. 자가 시세에서 주담대를 뺀 금액입니다. 없거나 모르겠으면 비워도 괜찮아요.", false],
  ["otherNetWorth", "기타 순자산", "2000", "만원 단위입니다. 차량, 보증금, 애매한 자산입니다. 없거나 모르겠으면 비워도 괜찮아요.", false],
  ["monthlyFixedExpense", "가구 월 고정비 총액", "230", "만원 단위입니다. 주거비, 보험, 통신, 구독처럼 반복되는 비용입니다.", true],
  ["monthlyVariableExpense", "평소 한 달 예상 변동비", "170", "만원 단위입니다. 지난달 실제 지출이 아니라 보통 한 달에 쓸 금액입니다.", true],
  ["monthlyRegularInvestment", "월 정기저축/투자", "200", "만원 단위입니다. 매달 투자가능 자산으로 쌓이는 저축과 투자입니다.", true],
] as const;

export function R0OnboardingForm() {
  const [state, formAction, pending] = useActionState(saveR0Snapshot, initialState);

  return (
    <form action={formAction} className="grid gap-5">
      {fields.map(([name, label, placeholder, help, required]) => (
        <label key={name} className="grid gap-2">
          <span className="text-sm font-medium text-slate-800">{label}</span>
          <input
            required={required}
            inputMode="numeric"
            name={name}
            placeholder={placeholder}
            className="rounded-md border border-slate-300 bg-white px-3 py-3 text-base outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
          <span className="text-xs leading-5 text-slate-500">{help}</span>
        </label>
      ))}

      {state.error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "계산 중..." : "첫 FIRE 결과 보기"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Create `app/onboarding/page.tsx`**

```tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/features/auth/lib/getCurrentUser";
import { R0OnboardingForm } from "@/src/features/onboarding/components/R0OnboardingForm";

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-8 text-slate-950">
      <div className="mx-auto grid max-w-2xl gap-8">
        <section className="grid gap-3">
          <p className="text-sm font-medium text-emerald-700">R0 Internal Alpha</p>
          <h1 className="text-3xl font-bold tracking-normal">먼저 신뢰할 수 있는 첫 결과를 확인해요</h1>
          <p className="text-base leading-7 text-slate-700">
            R0에서는 자가 부동산을 FIRE 계산에서 분리하고, 투자가능 순자산 기준으로 경제적 자유까지의
            거리를 확인합니다. 정확하지 않아도 괜찮아요. 지금은 첫 거리감을 보는 단계예요.
          </p>
        </section>
        <R0OnboardingForm />
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected:

```text
No ESLint warnings or errors
```

- [ ] **Step 4: Commit**

```bash
git add app/onboarding/page.tsx src/features/onboarding/components/R0OnboardingForm.tsx
git commit -m "feat: add r0 onboarding form"
```

Expected:

```text
[main
```

If this directory is not a git repository, skip the commit and record that in the task notes.

---

### Task 10: Add R0 Spouse Invite Link

**Files:**
- Create: `src/features/couple/lib/inviteToken.ts`
- Create: `src/features/couple/actions/createInviteLink.ts`
- Create: `src/features/couple/actions/createInviteLink.test.ts`
- Create: `src/features/couple/components/InvitePartnerCard.tsx`
- Create: `src/features/couple/components/InvitePartnerCard.test.tsx`
- Create: `app/invite/[token]/page.tsx`

- [ ] **Step 1: Create `src/features/couple/lib/inviteToken.ts`**

```ts
import { randomUUID } from "crypto";

export function createInviteToken() {
  return randomUUID();
}
```

- [ ] **Step 2: Create `src/features/couple/actions/createInviteLink.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createInviteToken } from "@/src/features/couple/lib/inviteToken";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export type CreateInviteLinkState = {
  error?: string;
  inviteUrl?: string;
};

export async function createInviteLink(
  _state: CreateInviteLinkState,
  formData: FormData,
): Promise<CreateInviteLinkState> {
  const coupleId = String(formData.get("coupleId") ?? "");

  if (!coupleId) {
    return { error: "워크스페이스 정보를 찾지 못했습니다." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const token = createInviteToken();
  const { error } = await supabase.from("couple_invites").insert({
    couple_id: coupleId,
    created_by: user.id,
    token,
  });

  if (error) {
    return { error: "초대 링크를 만들지 못했습니다." };
  }

  revalidatePath("/dashboard");

  return { inviteUrl: `/invite/${token}` };
}
```

- [ ] **Step 3: Add invite action tests**

Create `src/features/couple/actions/createInviteLink.test.ts`.

Test these branches with mocked `createSupabaseServerClient`, `createInviteToken`, and `revalidatePath`:

- Missing `coupleId` returns `"워크스페이스 정보를 찾지 못했습니다."`.
- Missing authenticated user returns `"로그인이 필요합니다."`.
- Valid lead-partner request inserts one pending invite and returns `/invite/{token}`.
- Insert failure returns `"초대 링크를 만들지 못했습니다."`.

- [ ] **Step 4: Create `src/features/couple/components/InvitePartnerCard.tsx`**

```tsx
"use client";

import { useActionState, useState } from "react";
import { createInviteLink, type CreateInviteLinkState } from "@/src/features/couple/actions/createInviteLink";

const initialState: CreateInviteLinkState = {};

function toShareableInviteUrl(inviteUrl: string) {
  if (inviteUrl.startsWith("http")) {
    return inviteUrl;
  }

  return new URL(inviteUrl, window.location.origin).toString();
}

export function InvitePartnerCard({ coupleId, latestInviteUrl }: { coupleId: string; latestInviteUrl?: string }) {
  const [state, formAction, pending] = useActionState(createInviteLink, initialState);
  const [copied, setCopied] = useState(false);
  const inviteUrl = state.inviteUrl ?? latestInviteUrl;

  async function copyInviteUrl() {
    if (!inviteUrl) {
      return;
    }

    await navigator.clipboard.writeText(toShareableInviteUrl(inviteUrl));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="grid gap-2">
        <p className="text-sm font-medium text-emerald-700">함께 보기</p>
        <h2 className="text-xl font-semibold text-slate-950">배우자에게 공유할 준비</h2>
        <p className="text-sm leading-6 text-slate-600">
          R0에서는 링크 생성과 복사 행동으로 공유 의향을 봅니다. 배우자의 가입, 입력, 체크인은 R1에서
          이어집니다.
        </p>
      </div>

      <form action={formAction} className="mt-4">
        <input type="hidden" name="coupleId" value={coupleId} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "링크 만드는 중..." : "배우자 초대 링크 만들기"}
        </button>
      </form>

      {inviteUrl ? (
        <div className="mt-3 grid gap-2">
          <p className="break-all rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">{inviteUrl}</p>
          <button
            type="button"
            onClick={copyInviteUrl}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            {copied ? "복사했어요" : "초대 링크 복사"}
          </button>
        </div>
      ) : null}

      {state.error ? <p className="mt-3 text-sm text-red-700">{state.error}</p> : null}
    </section>
  );
}
```

- [ ] **Step 5: Add invite card component tests**

Create `src/features/couple/components/InvitePartnerCard.test.tsx`:

```tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InvitePartnerCard } from "./InvitePartnerCard";

vi.mock("@/src/features/couple/actions/createInviteLink", () => ({
  createInviteLink: vi.fn(),
}));

describe("InvitePartnerCard", () => {
  it("copies an absolute shareable invite URL", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<InvitePartnerCard coupleId="couple-1" latestInviteUrl="/invite/token-1" />);

    fireEvent.click(screen.getByRole("button", { name: "초대 링크 복사" }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("http://localhost/invite/token-1");
    });
    expect(screen.getByRole("button", { name: "복사했어요" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Create invite preview route**

Create `app/invite/[token]/page.tsx`:

```tsx
export default function InvitePreviewPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-slate-950">
      <div className="mx-auto grid max-w-2xl gap-4">
        <p className="text-sm font-medium text-emerald-700">함께 보기 초대</p>
        <h1 className="text-3xl font-bold tracking-normal">배우자 체크인은 R1에서 열립니다</h1>
        <p className="text-base leading-7 text-slate-700">
          이 링크는 R0에서 초대 의향을 확인하기 위한 알파 기능입니다. 실제 배우자 가입과 입력은 다음
          릴리즈에서 연결합니다.
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 7: Run invite tests**

Run:

```bash
npm run test -- src/features/couple/actions/createInviteLink.test.ts src/features/couple/components/InvitePartnerCard.test.tsx
```

Expected:

```text
5 passed
```

- [ ] **Step 8: Run lint**

Run:

```bash
npm run lint
```

Expected:

```text
No ESLint warnings or errors
```

- [ ] **Step 9: Commit**

```bash
git add app/invite src/features/couple
git commit -m "feat: add r0 spouse invite link"
```

Expected:

```text
[main
```

If this directory is not a git repository, skip the commit and record that in the task notes.

---

### Task 11: Build R0 Dashboard

**Files:**
- Create: `src/features/dashboard/components/R0Dashboard.tsx`
- Create: `src/features/dashboard/components/R0Dashboard.test.tsx`
- Create: `app/dashboard/page.tsx`

- [ ] **Step 1: Create `src/features/dashboard/components/R0Dashboard.tsx`**

```tsx
import { formatKrw, formatMonth } from "@/src/lib/format";

type R0Snapshot = {
  month: string;
  total_income: number;
  investable_net_worth: number;
  primary_residence_net_worth: number;
  other_net_worth: number;
  total_net_worth_for_display: number;
  fire_calculation_net_worth: number;
  fixed_expense: number;
  variable_expense: number;
  regular_investment: number;
  remaining_cash: number;
  monthly_asset_growth_capacity: number;
  annual_fire_expense: number;
  fire_target_asset: number;
  projected_fire_date: string | null;
};

export function R0Dashboard({ snapshot }: { snapshot: R0Snapshot }) {
  const rows = [
    ["우리 가족 표시 순자산", snapshot.total_net_worth_for_display],
    ["FIRE 계산 순자산", snapshot.fire_calculation_net_worth],
    ["거주 부동산 순자산", snapshot.primary_residence_net_worth],
    ["월 세후수입", snapshot.total_income],
    ["월 생활비", snapshot.fixed_expense + snapshot.variable_expense],
    ["월 정기저축/투자", snapshot.regular_investment],
    ["월 자산 증가 여력", snapshot.monthly_asset_growth_capacity],
    ["FIRE 목표 자산", snapshot.fire_target_asset],
  ] as const;

  return (
    <div className="grid gap-6">
      <section className="grid gap-2">
        <p className="text-sm font-medium text-emerald-700">{formatMonth(snapshot.month)} 기준</p>
        <h1 className="text-3xl font-bold tracking-normal">경제적 자유까지 남은 거리</h1>
        <p className="text-base text-slate-700">
          투자가능 순자산 기준 예상 도달 시점은{" "}
          <strong className="text-slate-950">{formatMonth(snapshot.projected_fire_date)}</strong> 입니다.
        </p>
        <p className="text-sm leading-6 text-slate-600">
          거주 부동산은 표시 순자산에는 포함하지만 R0 FIRE 계산에서는 제외합니다. 연 5%, 25배 룰 기준의
          참고용 시뮬레이션이며 투자 자문이 아닙니다.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{formatKrw(value)}</p>
          </div>
        ))}
      </section>

      {snapshot.projected_fire_date ? null : (
        <p className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
          현재 입력 기준으로는 목표 도달 시점을 계산하기 어려워요. 월 자산 증가 여력이 생기면 예상일을
          보여드릴 수 있어요.
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `app/dashboard/page.tsx`**

```tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { InvitePartnerCard } from "@/src/features/couple/components/InvitePartnerCard";
import { getCurrentUser } from "@/src/features/auth/lib/getCurrentUser";
import { R0Dashboard } from "@/src/features/dashboard/components/R0Dashboard";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const supabase = await createSupabaseServerClient();
  const { data: membership } = await supabase
    .from("couple_members")
    .select("couple_id")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!membership) {
    redirect("/onboarding");
  }

  const { data: snapshot } = await supabase
    .from("monthly_cashflow_snapshots")
    .select(
      "month,total_income,investable_net_worth,primary_residence_net_worth,other_net_worth,total_net_worth_for_display,fire_calculation_net_worth,fixed_expense,variable_expense,regular_investment,remaining_cash,monthly_asset_growth_capacity,annual_fire_expense,fire_target_asset,projected_fire_date",
    )
    .eq("couple_id", membership.couple_id)
    .order("month", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!snapshot) {
    redirect("/onboarding");
  }

  const { data: latestInvite } = await supabase
    .from("couple_invites")
    .select("token")
    .eq("couple_id", membership.couple_id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-8 text-slate-950">
      <div className="mx-auto grid max-w-4xl gap-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-600">Fire Banking</p>
          <Link href="/onboarding" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
            이번 달 값 수정
          </Link>
        </div>
        <R0Dashboard snapshot={snapshot} />
        <InvitePartnerCard
          coupleId={membership.couple_id}
          latestInviteUrl={latestInvite ? `/invite/${latestInvite.token}` : undefined}
        />
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Add dashboard component tests**

Create `src/features/dashboard/components/R0Dashboard.test.tsx`.

Test these branches:

- Shows the projected FIRE month when `projected_fire_date` exists.
- Shows the calculation-impossible recovery message when `projected_fire_date` is `null`.
- Formats KRW values without decimals.

- [ ] **Step 4: Run dashboard tests**

Run:

```bash
npm run test -- src/features/dashboard/components/R0Dashboard.test.tsx
```

Expected:

```text
3 passed
```

- [ ] **Step 5: Run lint**

Run:

```bash
npm run lint
```

Expected:

```text
No ESLint warnings or errors
```

- [ ] **Step 6: Commit**

```bash
git add app/dashboard/page.tsx src/features/dashboard/components/R0Dashboard.tsx src/features/dashboard/components/R0Dashboard.test.tsx
git commit -m "feat: add r0 dashboard"
```

Expected:

```text
[main
```

If this directory is not a git repository, skip the commit and record that in the task notes.

---

### Task 12: Add R0 End-to-End Smoke Test

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/r0-admin-solo.spec.ts`

- [ ] **Step 1: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
```

- [ ] **Step 2: Create `tests/e2e/r0-admin-solo.spec.ts`**

```ts
import { expect, test } from "@playwright/test";

test("landing page shows R0 positioning and Google sign in", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /부부가 함께 순자산과 경제적 자유 진척/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Google로 시작하기" })).toBeVisible();
});
```

- [ ] **Step 3: Run e2e smoke test**

Run:

```bash
npm run test:e2e
```

Expected:

```text
1 passed
```

- [ ] **Step 4: Commit**

```bash
git add playwright.config.ts tests/e2e/r0-admin-solo.spec.ts
git commit -m "test: add r0 landing smoke test"
```

Expected:

```text
[main
```

If this directory is not a git repository, skip the commit and record that in the task notes.

---

### Task 13: Final R0 Verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Create or replace `README.md`**

````md
# Fire Banking

R0 Internal Alpha + Invite Intent implementation for the FIRE couple app.

## R0 Scope

- Google OAuth login
- Lead-partner onboarding
- Korean-context monthly finance inputs
- Basic FIRE projection
- Monthly snapshot persistence
- Basic dashboard
- Spouse invite link generation and copy action as an invite-intent signal

## Environment

Copy `.env.example` to `.env.local` and fill:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run test
npm run lint
npm run build
npm run test:e2e
```
````

- [ ] **Step 2: Run unit tests**

Run:

```bash
npm run test
```

Expected:

```text
22 passed
```

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected:

```text
No ESLint warnings or errors
```

- [ ] **Step 4: Run production build**

Run:

```bash
npm run build
```

Expected:

```text
Compiled successfully
```

- [ ] **Step 5: Run e2e**

Run:

```bash
npm run test:e2e
```

Expected:

```text
1 passed
```

- [ ] **Step 6: Commit**

```bash
git add README.md
git commit -m "docs: document r0 setup"
```

Expected:

```text
[main
```

If this directory is not a git repository, skip the commit and record that in the task notes.

---

## Self-Review Checklist

- Spec coverage:
  - R0 Google OAuth login: Task 6.
  - R0 lead-partner onboarding: Tasks 7, 8, 9.
  - R0 total input fields: Tasks 7, 9.
  - R0 FIRE calculation: Task 3.
  - R0 monthly snapshot persistence: Tasks 5, 8.
  - R0 spouse invite link generation and copy action: Task 10.
  - R0 dashboard: Task 11.
  - R0 verification: Tasks 2, 3, 7, 10, 12, 13.
- Placeholder scan: passed; no red-flag placeholder language remains.
- Type consistency:
  - `FireProjectionInput` and `FireProjectionResult` are defined before use.
  - `r0OnboardingSchema` output names match `saveR0Snapshot`.
  - Supabase column names match migration and dashboard queries.

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| Eng Review | `gstack plan-eng-review` | Architecture, RLS, error paths, test coverage | 2 | DONE | Fixed RLS, SSR, Korean asset modeling, invite path, and tests |
| CEO Review | `gstack plan-ceo-review` | Product scope and validation sharpness | 2 | DONE | R0 is internal alpha, split into R0a core and R0b invite intent; R0+R1 is first external validation unit |

**VERDICT:** R0 is implementable as an internal alpha. Do not market R0 alone as the MVP. The first external validation unit is R0+R1, because the core product hypothesis requires spouse participation.

### What already exists

- `fire_couple_app_prd_v2.md`: product direction, long-term scope, tech stack, and domain model.
- `docs/superpowers/specs/2026-04-25-fire-banking-mvp-design.md`: R0-R3 release split and R0 validation criteria.
- No application source code exists yet. This directory is not currently a git repository, so commit steps must be skipped unless `git init` is done before implementation.

### NOT in scope

- Kakao OAuth: deferred to R1 because R0 uses Google for the lead partner.
- Lite onboarding and Lite check-in: deferred to R1 because R0 only measures invite intent, not spouse completion.
- Detailed fixed-cost CRUD, ledger, debt breakdown, and simulation controls: deferred to R2 because R0 uses total monthly inputs.
- Request system, monthly result cards, PWA polish, and retention loops: deferred to R3 because they depend on the monthly ritual working.
- AI analysis, investment news, automatic bank sync, and paid SaaS packaging: deferred until repeated usage is proven.

### Eng review findings fixed

- `[P1] (confidence: 8/10) supabase/migrations/0001_r0_admin_solo.sql — couple_members SELECT policy referenced couple_members from inside its own RLS policy. That can trigger recursive-policy failures. Fixed by using security-definer membership helper functions instead of recursive policy subqueries.`
- `[P1] (confidence: 8/10) src/lib/supabase/server.ts — Supabase SSR session refresh path was missing. Fixed by adding root proxy.ts and src/lib/supabase/proxy.ts using getClaims().`
- `[P2] (confidence: 9/10) package.json — Task 2 changed lint to next lint, but current Next docs use ESLint CLI and Next 16 removed next lint. Fixed to eslint . throughout.`
- `[P2] (confidence: 8/10) package.json — React Hook Form, @hookform/resolvers, and date-fns were listed but unused. Removed to keep the R0 dependency surface honest.`
- `[P2] (confidence: 8/10) app/page.tsx — Public landing depended on server Supabase auth, making smoke tests and first-run dev fragile without real env vars. Fixed by keeping / public and protecting /onboarding and /dashboard.`
- `[P2] (confidence: 7/10) src/features/onboarding/actions/saveR0Snapshot.ts — profile and membership lookup errors were silent. Fixed by naming each failure path and returning user-visible Korean errors.`
- `[P2] (confidence: 8/10) tests — Only pure math/schema and a landing smoke test were covered. Added server action and dashboard component test requirements.`
- `[P1] (confidence: 9/10) product scope — R0 could be mistaken for the product MVP while failing to test the couple ritual. Fixed by redefining R0 as internal alpha, splitting execution into R0a/R0b, and naming R0+R1 as the first external validation unit.`
- `[P1] (confidence: 8/10) finance domain — currentNetWorth made Korean primary residence distort FIRE dates. Fixed by splitting investable net worth, primary residence net worth, and other net worth, and by using only investable net worth in R0 FIRE projection.`
- `[P2] (confidence: 8/10) data model — unique(user_id) blocked future multi-workspace and R1 spouse membership. Removed it and replaced recursive RLS with security-definer membership helper functions.`
- `[P2] (confidence: 8/10) product behavior — R0 had no social action. Added spouse invite link generation, copy action, and invite status display while deferring Lite onboarding to R1.`
- `[P2] (confidence: 8/10) trust/legal — FIRE assumptions and advisory disclaimer were missing. Added required result-screen assumption copy and "참고용 시뮬레이션이며 투자 자문이 아닙니다."`
- `[P2] (confidence: 7/10) UI language — Admin/Lite labels create unwanted hierarchy in a couple product. Kept DB roles but required neutral user-facing Korean copy.`

### Code path coverage plan

```text
CODE PATH COVERAGE
==================
[+] calculateFireProjection()
    ├── [★★★] target/growth happy path
    ├── [★★★] primary residence excluded from FIRE calculation
    ├── [★★★] impossible growth returns null date
    └── [★★★] already at FIRE returns start month

[+] r0OnboardingSchema
    ├── [★★★] manwon inputs normalize to KRW numbers
    ├── [★★★] optional residence and other net worth blank values normalize to 0
    ├── [★★★] blank required money inputs are rejected
    └── [★★★] negative values rejected

[+] saveR0Snapshot()
    ├── [★★★] invalid form data
    ├── [★★★] missing user
    ├── [★★★] profile upsert failure
    ├── [★★★] existing membership snapshot upsert
    ├── [★★★] new couple/member/snapshot path
    ├── [★★★] membership insert race recovery
    └── [★★★] snapshot upsert failure

[+] createInviteLink()
    ├── [★★★] missing couple id
    ├── [★★★] missing user
    ├── [★★★] valid invite insert returns /invite/{token}
    └── [★★★] invite insert failure

[+] InvitePartnerCard
    └── [★★★] copy button writes absolute shareable invite URL

[+] R0Dashboard
    ├── [★★★] projected date visible
    ├── [★★★] assumptions and advisory disclaimer visible
    ├── [★★★] impossible-date recovery message visible
    └── [★★★] KRW values formatted without decimals

USER FLOW COVERAGE
==================
[+] Public landing
    └── [★★] [→E2E] shows R0 positioning and Google sign-in button

[+] Full Google OAuth + real Supabase write
    └── [MANUAL] Requires configured Supabase project and Google OAuth credentials

COVERAGE TARGET: 22 unit/component tests + 1 E2E smoke + manual OAuth/Supabase verification
```

### Data flow

```text
Google OAuth
  -> /auth/callback exchanges code
  -> /onboarding validates Korean-context manwon inputs and normalizes them to KRW
  -> saveR0Snapshot
       -> upsert profile
       -> find or create lead-partner workspace
       -> calculateFireProjection using investable net worth only
       -> upsert monthly snapshot by couple_id + month
  -> /dashboard reads latest snapshot
  -> R0Dashboard renders result, assumptions, disclaimer, or "calculation unavailable"
  -> InvitePartnerCard generates and copies spouse invite link
  -> /invite/{token} shows R0 alpha invite preview
```

### Failure modes

| Codepath | Failure | Plan response | User sees |
|----------|---------|---------------|-----------|
| Auth callback | Missing or invalid OAuth code | Redirect with error query | Landing remains reachable |
| Supabase SSR | Expired token | proxy refreshes via `getClaims()` | Normal page load if refresh succeeds |
| Validation | Blank required input, non-number, negative, decimal | Zod rejects | First validation message |
| Optional asset context | Blank residence or other net worth | Normalize to 0 | User can continue without guessing |
| Korean asset modeling | Primary residence would distort FIRE date | Exclude residence from R0 FIRE calculation | Displayed separately with assumption copy |
| Profile upsert | RLS/network/db error | Return named error | 프로필을 저장하지 못했습니다. |
| Membership lookup | RLS/network/db error | Return named error | 워크스페이스 정보를 불러오지 못했습니다. |
| First workspace create | Couple insert fails | Return named error | 워크스페이스를 만들지 못했습니다. |
| Double submit/two tabs | Membership insert races | Re-read existing membership | Continues if another request won |
| Snapshot upsert | DB/RLS/network error | Return named error | 이번 달 스냅샷을 저장하지 못했습니다. |
| Invite creation | Missing couple id, missing user, DB/RLS error | Return named error | 초대 링크를 만들지 못했습니다. |
| FIRE impossible | Growth <= 0 and target not reached | Null projected date | Clear recovery message |

### Worktree parallelization strategy

Sequential implementation is safest until the scaffold and dependencies exist. After Task 5, work can split:

| Step | Modules touched | Depends on |
|------|-----------------|------------|
| Calculation + validation | `src/features/fire`, `src/features/onboarding/lib` | Tasks 1-2 |
| Supabase auth/schema | `src/lib/supabase`, `supabase`, `app/auth` | Tasks 1-2 |
| Onboarding save/form | `src/features/onboarding`, `app/onboarding` | Calculation + validation, Supabase auth/schema |
| Invite link | `src/features/couple`, `app/invite` | Supabase auth/schema |
| Dashboard | `src/features/dashboard`, `app/dashboard` | Supabase auth/schema, snapshot shape, invite link |
| E2E/docs | `tests`, `README.md` | User-visible routes |

Recommended execution for this repo: sequential inline implementation. The project is greenfield and small enough that parallel worktrees would spend more time coordinating shared scaffold files than saving time.
