# FIRE Living Expense Adjuster Refactor Implementation Plan

> Document status: historical implementation plan. Current product scope and priorities live in `fire_couple_app_prd_v2.md`. Keep this file only for living-expense implementation history.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the existing fixed-cost simulator into a FIRE living expense adjuster that calculates recommended monthly living expense, reloads saved state, and applies recommendations to the dashboard snapshot only when the user requests it.

**Architecture:** Keep the existing `/subscribe` route and component shell, but expand the domain model from fixed-cost-only to fixed, variable, and buffer expense inputs. Use the existing `fixed_cost_simulations.config` JSON for draft state, and update the current monthly cashflow snapshot when the explicit apply action runs.

**Tech Stack:** Next.js 16 App Router, React 19, Supabase server client, Zod, Vitest, Testing Library.

---

### Task 1: Projection Model

**Files:**
- Modify: `src/features/subscribe/lib/fixedCostTypes.ts`
- Modify: `src/features/subscribe/lib/fixedCostSimulator.ts`
- Modify: `src/features/subscribe/lib/fixedCostDefaults.ts`
- Test: `src/features/subscribe/lib/fixedCostSimulator.test.ts`

- [ ] **Step 1: Write failing tests**

Add tests that expect `calculateFixedCostProjection` to return `monthlyRecurringFixedExpense`, `monthlyVariableExpense`, `monthlyBufferExpense`, `recommendedTargetMonthlyExpense`, `fireTargetAsset`, and non-negative dashboard deltas.

- [ ] **Step 2: Run red test**

Run: `npm test -- src/features/subscribe/lib/fixedCostSimulator.test.ts`
Expected: FAIL because projection fields do not exist yet.

- [ ] **Step 3: Implement minimal model changes**

Add `bufferMonthlyAmount` to `FixedCostSimulatorConfig`, keep `subscriptionCategories` and `livingExpenses`, and calculate:

```ts
recommendedTargetMonthlyExpense = recurringFixedTotal + variableTotal + bufferMonthlyAmount;
fireTargetAsset = recommendedTargetMonthlyExpense * 12 * 25;
remainingAmount = Math.max(fireTargetAsset - dashboard.fireNetWorth, 0);
```

Use optional dashboard baseline fields so existing tests and callers can still pass defaults.

- [ ] **Step 4: Run green test**

Run: `npm test -- src/features/subscribe/lib/fixedCostSimulator.test.ts`
Expected: PASS.

### Task 2: Saved State and Apply Action

**Files:**
- Modify: `src/features/subscribe/actions/saveFixedCostSimulation.ts`
- Create: `src/features/subscribe/actions/applyFireLivingExpenseRecommendation.ts`
- Test: `src/features/subscribe/actions/saveFixedCostSimulation.test.ts`
- Test: `src/features/subscribe/actions/applyFireLivingExpenseRecommendation.test.ts`

- [ ] **Step 1: Write failing tests**

Test that the config schema accepts `bufferMonthlyAmount`, saved config can be loaded for the current user, and the apply action updates only the current monthly snapshot after recalculating FIRE target fields.

- [ ] **Step 2: Run red tests**

Run: `npm test -- src/features/subscribe/actions/saveFixedCostSimulation.test.ts src/features/subscribe/actions/applyFireLivingExpenseRecommendation.test.ts`
Expected: FAIL because load/apply actions do not exist.

- [ ] **Step 3: Implement server actions**

Add `getSavedFixedCostSimulationConfig()` to read `fixed_cost_simulations.config`, returning `null` on missing rows or invalid legacy JSON. Add `applyFireLivingExpenseRecommendation(config)` that finds the admin couple membership, reads the current month snapshot, recalculates target expense fields with `calculateFireProjection`, and updates `monthly_cashflow_snapshots`.

- [ ] **Step 4: Run green tests**

Run: `npm test -- src/features/subscribe/actions/saveFixedCostSimulation.test.ts src/features/subscribe/actions/applyFireLivingExpenseRecommendation.test.ts`
Expected: PASS.

### Task 3: UI Refactor

**Files:**
- Modify: `src/features/subscribe/components/FixedCostSimulator.tsx`
- Modify: `src/features/subscribe/components/FixedCostSimulator.test.tsx`
- Modify: `app/subscribe/page.tsx`
- Modify: `app/dashboard/page.tsx`
- Modify: `src/features/dashboard/lib/dashboardRoleUi.ts`
- Test: `src/features/dashboard/lib/dashboardRoleUi.test.ts`
- Test: `app/dashboard/mobile/page.test.tsx`

- [ ] **Step 1: Write failing tests**

Update component tests to expect `FIRE 생활비 조정기`, variable expense controls, buffer presets, `추천값 적용`, and separate save/apply action calls.

- [ ] **Step 2: Run red tests**

Run: `npm test -- src/features/subscribe/components/FixedCostSimulator.test.tsx src/features/dashboard/lib/dashboardRoleUi.test.ts app/dashboard/mobile/page.test.tsx`
Expected: FAIL because labels and apply UI are not refactored yet.

- [ ] **Step 3: Implement UI changes**

Rename user-facing labels, split summary cards into fixed/variable/buffer/recommended expense, add buffer amount presets, wire `applyAction`, and load saved config in `app/subscribe/page.tsx`.

- [ ] **Step 4: Run green tests**

Run: `npm test -- src/features/subscribe/components/FixedCostSimulator.test.tsx src/features/dashboard/lib/dashboardRoleUi.test.ts app/dashboard/mobile/page.test.tsx`
Expected: PASS.

### Task 4: Verification

**Files:**
- No code changes.

- [ ] **Step 1: Run focused suite**

Run: `npm test -- src/features/subscribe/lib/fixedCostSimulator.test.ts src/features/subscribe/components/FixedCostSimulator.test.tsx src/features/dashboard/lib/dashboardRoleUi.test.ts`
Expected: PASS.

- [ ] **Step 2: Run project checks**

Run: `npm test`
Expected: PASS.

Run: `npm run lint`
Expected: PASS.

### Self-Review

- Spec coverage: Covers rename, fixed/variable/buffer calculation, saved state reload, and explicit apply behavior. Full multi-select application UI is deferred; this first refactor applies the recommended target monthly expense and recalculated FIRE fields as one explicit action.
- Placeholder scan: No TBD/TODO placeholders.
- Type consistency: Existing names stay where they reduce churn; new fields use living-expense terminology in projection outputs.
