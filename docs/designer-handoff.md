# Fire Banking Design Refactor Handoff

- Updated: 2026-05-04
- Purpose: hand off only the app structure, screen requirements, component inventory, state rules, and implementation constraints needed for a product design refactor.
- Source of truth: `fire_couple_app_prd_v2.md`
- Out of scope for this handoff: brand tone, visual mood, color direction, typography direction, copy tone, marketing positioning, and decorative style guidance.

If this document conflicts with `fire_couple_app_prd_v2.md`, the PRD wins.

## Current App State

The app is a Next.js 16 / React 19 closed-beta FIRE check-in product for couples.

Implemented or partially implemented surfaces:

- `/`: entry/login surface.
- `/onboarding`: Admin first-input flow with four primary numbers.
- onboarding result bridge: first FIRE result plus spouse invite CTA and dashboard fallback.
- `/dashboard`: primary home dashboard.
- `/dashboard/mobile`: mobile dashboard preview/test surface.
- `/history`: monthly snapshot history with empty-state behavior.
- `/together`: partner connection and check-in status.
- `/settings`: limited settings with only working or explainable items.
- `/invite/[token]`: spouse invite acceptance entry.
- `/subscribe`: FIRE living expense adjuster.
- `/assets`: FIRE asset diagnosis.
- `/showcase` and `/design-system`: internal visual/component preview routes.

Current implementation has active work in progress. Do not assume every route is final. The design refactor should preserve the product model below and may reorganize layout/component hierarchy.

## Product Model

Fire Banking is not a daily ledger, portfolio analytics product, or investment recommendation tool.

The app centers on one monthly loop:

1. Admin enters or confirms the household FIRE baseline.
2. Admin sees a first FIRE result quickly.
3. Admin invites spouse/partner.
4. Lite partner enters three numbers.
5. The couple sees a shared FIRE result.
6. Monthly snapshots create history over time.

Primary calculations:

- monthly living expense
- annual living expense
- FIRE target asset
- FIRE reflected net worth
- remaining FIRE amount
- monthly asset growth capacity
- estimated time to FIRE when calculable

Calculation assumptions that must stay visible in relevant result screens:

- 25x annual expense rule
- 5% annual compounding assumption
- simple simulation, not investment advice
- couple workspace amount data is shared between partners

## Navigation And IA

Closed beta bottom navigation has four tabs:

- Home: `/dashboard`
- History: `/history`
- Together: `/together`
- Settings: `/settings`

The app must not expose a separate Analysis tab in closed beta.

Secondary entries from Home:

- FIRE living expense adjuster: `/subscribe`
- FIRE asset diagnosis: `/assets`

Auth and onboarding routes:

- `/`
- `/onboarding`
- `/invite/[token]`
- `/auth/callback`

Internal-only routes:

- `/showcase`
- `/design-system`

## Required Screens

### Entry

Required content blocks:

- app identity
- concise product definition
- sign-in action
- auth error state when callback fails

The entry screen is not the main product experience. It should lead users into onboarding or dashboard quickly.

### Admin Onboarding

Required inputs:

- target monthly living expense, unit `만원`
- after-tax monthly income, unit `만원`
- total monthly expense, unit `만원`
- investable net worth, unit `만원`

Required behaviors:

- input formatting for Korean `만원` amounts
- clear confirmation of large numbers
- submit action to save the first snapshot
- edit path should be able to prefill from the latest snapshot when data exists

### First FIRE Result Bridge

Required components:

- first FIRE result summary
- FIRE target asset explanation
- remaining amount
- spouse invite recommendation
- primary CTA: ask spouse for three numbers
- secondary CTA: view dashboard first

This screen should not become a full dashboard. It is a one-time comprehension and invite bridge.

### Dashboard

Dashboard is the core screen for the design refactor.

Required top-level modules:

- current check-in month
- check-in status
- FIRE goal graph
- target monthly living expense
- FIRE target asset
- FIRE reflected net worth
- monthly asset growth capacity
- estimated time to FIRE or calculation-unavailable state
- current month cashflow summary
- spouse check-in card only when spouse work is incomplete
- entry card for FIRE living expense adjuster
- entry card for FIRE asset diagnosis

Required FIRE goal graph:

- Use the attached reference structure: title `FIRE까지 남은 금액`, right-aligned remaining amount, horizontal progress track, current-position marker, 0% / 25% / 50% / 100% ticks.
- The 100% end of the FIRE bar must use the existing animated fire GIF already implemented in `components/fire-banking/fire-timeline.tsx`.
- The fire GIF source currently used by the app is `https://em-content.zobj.net/source/animated-noto-color-emoji/356/fire_1f525.gif`.
- The designer may change layout and sizing, but the moving fire indicator at the FIRE end should remain part of the dashboard graph requirement.
- The graph must support both mobile and desktop dashboard widths without label overlap.
- The graph must handle 0%, partial progress, 100%, and over-target clamped states.

Required spouse-card state rules:

- no invite yet: show invite recommendation/action
- invite sent but not accepted: show waiting state and copy/share action
- accepted but no Lite input: show input waiting state
- Lite input completed: remove the invite/pending card from dashboard and show completion status elsewhere

### Lite Invite And Check-In

Required flow:

1. invite link entry
2. invite acceptance
3. after-tax monthly income input
4. monthly recurring expense input
5. monthly recurring savings/investment input
6. completion confirmation

Required component behavior:

- one primary numeric decision per step
- quick reuse action for previous-month values when available
- completion should return the user to the shared result or a clear next state

### FIRE Living Expense Adjuster

Required summary modules:

- fixed expense
- variable expense
- buffer
- recommended target monthly living expense
- difference from current dashboard baseline

Required detail modules:

- fixed-cost categories
- variable-cost groups
- buffer input
- save draft
- apply recommendation to dashboard baseline

State rule:

- Saving a draft must not change the dashboard baseline.
- Applying the recommendation is the explicit action that updates dashboard values.

### FIRE Asset Diagnosis

Required top module:

```text
FIRE reflected net worth
= immediately usable investment assets
- investment-linked loans
```

Required groups:

- FIRE reflected investment assets
- restricted/future assets
- reference assets
- investment-linked loans
- excluded liabilities when present

Required interactions:

- domestic instrument search
- holding quantity add/edit/delete
- manual US-listed holding valuation assist
- liability add/edit/delete

Dashboard dependency:

- Dashboard FIRE reflected net worth must use the same inclusion/exclusion rule as this screen.

### History

Required states:

- actual monthly snapshot list when data exists
- empty state when no snapshot exists
- month status: temporary or finalized
- previous-month comparison when computable

Hard requirement:

- Do not show hard-coded sample history as if it were real user data.

### Together

Required modules:

- partner connection status
- invite link creation/re-share
- current month check-in status
- Lite input completion state
- next check-in context

### Settings

Required modules:

- profile/account
- data and couple-sharing scope
- FIRE calculation assumptions
- non-advice disclaimer
- sign out

Hard requirement:

- Do not show fake settings rows or clickable-looking actions that do nothing.

## Component Inventory

Existing reusable components to preserve or refactor:

- app shell: `MobileAppShell`, `DesktopDashboard`, `BottomNav`, `ScreenTopBar`
- cards: `Card`, `MetricCard`, `FireHeroCard`, `DashboardFireOverview`
- FIRE graph: `FireTimeline`, `FireTimelineWide`
- cashflow: `CashflowSummary`, `CashflowStrip`
- check-in: `CheckinRow`, `StatusPill`
- partner: `InviteCard`, `AdminPartnerCard`, `PartnerWaitingCard`, `PartnerReadOnlyCard`
- forms: `FormField`, `MoneyInputRow`, onboarding stepper fields
- navigation/action: `Button`, icon buttons, entry cards

The design refactor can rename or reorganize components, but each of the responsibilities above needs a clear replacement.

## Data States

Every major metric component needs these states:

- loading
- no data
- partial couple data
- complete couple data
- calculation unavailable
- negative monthly cashflow
- over-target FIRE progress
- unauthenticated or signed-out fallback
- provider/search unavailable for asset valuation

Use explicit empty and unavailable states instead of placeholder sample numbers.

## Implementation Constraints

- Framework: Next.js 16 App Router
- React: 19
- Styling: Tailwind CSS 4
- Auth and database: Supabase
- Tests: Vitest, Testing Library, Playwright
- Current project has no external design-system package.
- Current app uses local `components/fire-banking/*` components.
- The design should be implementable as responsive app screens, not a marketing landing page.
- Mobile is required; desktop dashboard may use a denser layout.

## Designer Deliverables

Requested deliverables:

- mobile dashboard layout
- desktop dashboard layout
- Admin onboarding flow
- first FIRE result bridge
- Lite invite/check-in flow
- Together state screens
- FIRE living expense adjuster screen
- FIRE asset diagnosis screen
- History empty/list states
- Settings data-sharing/calculation sections
- component inventory with states for cards, graph, inputs, bottom navigation, status pills, and action rows

Do not spend deliverable effort on brand tone, visual mood boards, marketing hero direction, or copywriting system unless separately requested.
