# Fire Banking — Design Refactor

- Date: 2026-05-05
- Owner: design refactor
- Status: design (awaiting plan)

## Goal

Bring the running Fire Banking app at `/Users/macmini-cho/Documents/Project/FireBanking` into 1:1 alignment with the high-fidelity Claude-Design HTML/JSX prototype, finish the visual cleanup the previous palette migration left behind, and ship the two new screens that exist in the prototype but not in the app.

This refactor is visual + structural. It does not change product behavior, calculation rules, or backend contracts.

## Sources of Truth

When sources disagree, the higher-priority source wins.

1. `fire_couple_app_prd_v2.md` — product rules. Always wins on behavior.
2. `~/Downloads/Fire-Banking-·-Claude-Design-원본/` — high-fidelity prototype (entry: `firebanking-claude-design-updated-30.html`). Wins on layout, spacing, hierarchy, copy placement.
3. `open-design/design-systems/firebanking/DESIGN.md` — token names, shadow direction, "never" list, OD comment-marker rule.
4. `~/Downloads/Fire-Banking-·-Claude-Design-원본/moqpi3rm-designer-handoff.md` — route ↔ screen ↔ component map and per-screen required modules.

## Current State Snapshot

- App is Next.js 16 App Router + React 19 + Tailwind CSS 4 + Supabase + Vitest/Playwright.
- `app/globals.css @theme` already defines the new palette (Trust Blue, ink alpha scale, status triads, Kakao). The bulk of pages already use the new tokens (`fb-ink` 138 uses, `fb-trust` 65, `fb-trust-soft` 26, `fb-line` 47).
- `tailwind.config.ts` still carries the old "A" palette (`fb-bg`, `fb-sand`, `fb-stone`, `fb-sage`, `fb-slate`, `fb-bluegray`, `fb-green`, `fb-warning`, `fb-danger`, `fb-surface`, `fb-muted`, `fb-subtle`) and green-tinted shadows. This conflicts with v4 `@theme` and DESIGN.md "Never" list.
- 22 occurrences of old A-palette classes remain across `app/` and `components/`.
- Token values in `globals.css` drift from DESIGN.md and `ds/colors_and_type.css` on shadows and radii.
- `components/fire-banking/` already contains every component listed in the handoff inventory (`Card`, `MetricCard`, `FireHeroCard`, `FireTimeline`, `BottomNav`, `StatusPill`, `InviteCard`, `Button`, `FormField`, etc.). No new component files are needed for existing screens.
- `app/insights/page.tsx` is a 4-line redirect to `/dashboard` with zero incoming references. Closed-beta IA forbids an Analysis tab.
- Two prototype screens have no corresponding app route: `03b-result-bridge` and `05-lite-onboarding`.

## Scope

### In Scope

- Token alignment (`tailwind.config.ts` cleanup, `globals.css` value fixes, residual class migration).
- Per-screen visual refactor of all 10 existing routes against the prototype.
- Two new screens: onboarding result bridge, Lite spouse onboarding.
- `/insights` cleanup (delete + 308 redirect).
- OD comment markers (`data-screen-label`, `data-od-id`) on every refactored screen per DESIGN.md §10.
- Playwright smoke screenshots at mobile (375) and desktop (1280) per refactored route.

### Out of Scope

- Product behavior changes, calculation logic, Supabase schema, API/cron handlers.
- Marketing/landing surfaces, brand mood, copy rewrite (microcopy nudges allowed when the prototype shows different wording).
- Component-library extraction beyond what already lives in `components/fire-banking/`.
- Analysis-tab features in any form (PRD/handoff forbids in closed beta).

## Route ↔ Prototype Screen Map

| Prototype `screens/*.jsx` | App route | Status |
| --- | --- | --- |
| `01-login.jsx` | `app/auth/` | Existing. Visual pass. Kakao button stays brand-locked. |
| `02-admin-onboarding.jsx` (+ `onboarding-stepper.jsx`) | `app/onboarding/` | Existing. Visual pass. |
| `03b-result-bridge.jsx` | `app/onboarding/result/` | **NEW.** One-time bridge screen; do not grow into a dashboard. |
| `03-dashboard.jsx` | `app/dashboard/` (mobile branch) | Existing. Visual pass. |
| `11-desktop-dashboard.jsx` | `app/dashboard/` (desktop branch) | Existing. Visual pass on the desktop layout in `components/fire-banking/desktop-dashboard.tsx`. |
| `04-invite-accept.jsx` | `app/invite/[token]/` | Existing. Visual pass. |
| `05-lite-onboarding.jsx` | `app/invite/[token]/lite/` | **NEW.** Auto-continues from invite acceptance. |
| `06-simulator.jsx` | `app/subscribe/` | Existing. Visual pass. |
| `06b-assets.jsx` | `app/assets/` | Existing skeleton. Heavy visual pass (580 LOC source). |
| `07-history-tab.jsx` | `app/history/` | Existing. Visual pass. Honor handoff "no fake history rows". |
| `09-together-tab.jsx` | `app/together/` | Existing. Visual pass. |
| `10-settings-tab.jsx` | `app/settings/` | Existing. Visual pass. Honor handoff "no fake settings rows". |
| — | `app/insights/` | Delete + add `next.config.ts` 308 redirect to `/dashboard`. |

`app/showcase/` and `app/design-system/` are internal-only previews; they should still build but get no design effort beyond compiling under the new tokens.

## Step 0 — Token Alignment

One PR, mostly mechanical, no visible UI movement.

**`tailwind.config.ts`** — remove the `theme.extend.colors.fb`, `borderRadius`, `boxShadow` blocks entirely. Keep only `content` globs. Tailwind v4 reads colors/radii/shadows from `@theme` in `globals.css`; the v3-style config blocks shadow `@theme` with the legacy A palette and green shadows.

**`app/globals.css @theme`** — fix drift against `ds/colors_and_type.css` and DESIGN.md:

- `--shadow-card: 0 10px 30px rgba(0, 102, 255, 0.06)` (currently `none`)
- `--shadow-soft: 0 18px 60px rgba(0, 102, 255, 0.10)` (currently grey-tinted)
- `--shadow-elevated: 0 28px 90px rgba(0, 102, 255, 0.14)` (currently grey-tinted)
- `--radius-card: 1.125rem` (currently `20px`)
- `--radius-button: 0.875rem` (currently `12px`)
- Add `--color-fb-kakao: #f8d75b` and `--color-fb-kakao-ink: #191919`.

**Residual A-palette migration** (22 occurrences total):

| Old class | New class | Count |
| --- | --- | --- |
| `fb-muted` | `fb-ink-2` | 11 |
| `fb-green` | `fb-trust` (decorative) or `fb-positive` (status) | 4 |
| `fb-stone` | `fb-line` | 2 |
| `fb-sand` | `fb-card-alt` | 2 |
| `fb-sage` | `fb-positive` | 1 |
| `fb-slate` | `fb-ink` | 1 |
| `fb-surface` | `fb-card` | 1 |

`fb-green` requires per-occurrence judgment (status vs. accent). All others are mechanical.

**Verification:** `pnpm typecheck && pnpm test && pnpm build` plus manual render of `/showcase` and `/design-system`.

## Step 1 — Per-Screen Visual Pass

Every screen follows the same loop:

1. Read prototype `screens/NN-*.jsx` end to end.
2. Read corresponding `app/<route>/page.tsx` plus the `components/fire-banking/*` it imports.
3. Diff layout, spacing, hierarchy, hero treatment, status pills, primary-CTA placement, copy placement.
4. Bring the route to 1:1 visual match. Use only tokens and component primitives that already exist; do not introduce new ones unless the prototype demands it.
5. Apply OD markers per DESIGN.md §10:
   - Top-level container: `data-screen-label="<screen>"` (e.g. `dashboard`, `assets`, `subscribe`, `lite-onboarding`).
   - Reusable instances: `data-od-id="<kebab-name>"`, with index suffix when repeated.
   - Stable across regenerations.
6. Add a Playwright smoke spec under `tests/` capturing the route at 375×812 and 1280×800.
7. One PR per screen.

Order (high-impact first):

1. Dashboard (mobile)
2. Dashboard (desktop)
3. Assets
4. Subscribe (FIRE living-expense adjuster)
5. Onboarding (admin)
6. History
7. Together
8. Settings
9. Invite acceptance
10. Auth (preserve Kakao brand-locked treatment from DESIGN.md §4)

Per-screen rules drawn from the handoff that the design must respect:

- **Dashboard**: FIRE goal graph keeps the existing animated fire GIF at the 100 % end (`https://em-content.zobj.net/source/animated-noto-color-emoji/356/fire_1f525.gif`). Graph supports 0 %, partial, 100 %, over-target clamp. Spouse card disappears when Lite input is complete.
- **Assets**: top module is `FIRE reflected net worth = immediately usable investment assets − investment-linked loans`. Inclusion/exclusion rule must match dashboard.
- **Subscribe**: saving a draft does not change dashboard baseline; only "apply recommendation" does.
- **History**: never render hard-coded sample rows as if real.
- **Settings**: never render fake/non-functional rows.
- **Auth**: Kakao button stays `bg-fb-kakao text-fb-kakao-ink`; do not restyle.

## Step 2 — New Screens

### 2.1 Onboarding Result Bridge — `app/onboarding/result/page.tsx`

- Entered automatically once after the admin finishes the four `만원` inputs in `/onboarding`.
- 1:1 port of `03b-result-bridge.jsx`.
- Modules required by handoff: first FIRE result summary, FIRE-target-asset explanation, remaining amount, spouse invite recommendation.
- Single primary CTA: "배우자에게 3가지 묻기" → invite share flow.
- Single secondary CTA: "먼저 대시보드 보기" → `/dashboard`.
- This is a one-time comprehension screen. It must not grow into a full dashboard.
- New container component: `OnboardingResultBridge` under `components/fire-banking/`.

### 2.2 Lite Spouse Onboarding — `app/invite/[token]/lite/page.tsx`

- Entered automatically after `/invite/[token]` acceptance.
- 1:1 port of `05-lite-onboarding.jsx`.
- Three sequential numeric steps (one primary numeric decision per step):
  1. after-tax monthly income (`만원`)
  2. monthly recurring expense (`만원`)
  3. monthly recurring savings/investment (`만원`)
- "Reuse last month's value" quick action when previous data exists.
- Completion returns the partner to the shared dashboard or a clear next state.
- Reuses `components/fire-banking/onboarding-stepper.tsx` patterns. New flow component: `LiteOnboardingFlow` (or extend the existing `lite-onboarding.tsx`; the implementation plan picks).
- Token resolution and partner-link state come from existing `/invite/[token]` server logic; the new route reads the same record and writes the three fields, then marks completion.

### 2.3 Insights Cleanup

- Delete `app/insights/page.tsx` and `app/insights/page.test.tsx`. Remove the empty folder.
- Add to `next.config.ts`:

  ```ts
  async redirects() {
    return [
      { source: '/insights', destination: '/dashboard', permanent: true },
    ];
  }
  ```

- Verifies handoff rule: closed beta exposes no Analysis tab.

## Component Strategy

- Existing `components/fire-banking/*` covers the handoff inventory. Refactor in place; do not extract a new package.
- New components limited to the two new screens:
  - `OnboardingResultBridge` — composes `FireHeroCard`, `Button`, `InviteCard`.
  - `LiteOnboardingFlow` — composes `MoneyInputRow`, `FormField`, the existing stepper. May supersede or extend `lite-onboarding.tsx`; the implementation plan decides.
- Component renames are out of scope. Keep current file names so `git blame` and existing tests stay coherent.

## Data States Each Metric Component Must Render

Mirrors the handoff requirement. The visual pass must verify each card renders these states without crashing or showing stale numbers:

- loading
- no data
- partial couple data
- complete couple data
- calculation unavailable
- negative monthly cashflow
- over-target FIRE progress
- unauthenticated / signed-out fallback
- provider/search unavailable for asset valuation

The visual pass does not invent new state UI; it confirms the prototype's treatment for each state matches the implementation, and fixes drift.

## Testing & Verification

- Per PR: `pnpm typecheck`, `pnpm test`, `pnpm build`.
- Per refactored route: a Playwright smoke spec under `tests/` that loads the route at 375×812 and 1280×800 and asserts it mounts plus snapshots a screenshot.
- New screens: a Vitest spec covering the primary-CTA path and the Lite three-step happy path (mirrors patterns in `lite-onboarding.test.tsx`, `onboarding-stepper.test.tsx`).
- OD-marker check: every refactored screen has exactly one `data-screen-label` on its container and `data-od-id` on every component instance a reviewer might pin.
- PRD-conformance check before each PR: open `fire_couple_app_prd_v2.md` for the relevant section and confirm no behavior drift.

## Migration Order

13 PRs, each independently mergeable, ordered to land safety/cleanup first, then highest-impact visual surfaces, then the two new flows, then long-tail screens.

```
PR-0   Step 0  Token alignment + residual class migration
PR-1   Step 2  /insights deletion + redirect
PR-2   Step 1  Dashboard (mobile)
PR-3   Step 1  Dashboard (desktop)
PR-4   Step 1  Assets
PR-5   Step 1  Subscribe
PR-6   Step 1  Onboarding (admin)
PR-7   Step 2  /onboarding/result (NEW)
PR-8   Step 1  Invite acceptance
PR-9   Step 2  /invite/[token]/lite (NEW)
PR-10  Step 1  History
PR-11  Step 1  Together
PR-12  Step 1  Settings + Auth
```

## Risks & Mitigations

- **Tailwind v4 / v3 config interaction.** Removing `theme.extend.colors.fb` from `tailwind.config.ts` while pages still reference an old class will silently render unstyled. Mitigation: PR-0 ships token cleanup and residual-class migration in the same commit; CI build must succeed.
- **OD-marker drift on regeneration.** Markers must be stable across regenerations (DESIGN.md §10). Mitigation: name markers from semantic role, not visual position; record naming choices inline in each refactored file as JSX attributes.
- **Behavior change masquerading as design.** A visual pass can accidentally drop a state branch. Mitigation: each PR explicitly enumerates the data states it touches against the list above and preserves every branch.
- **Insights redirect SEO/bookmarks.** `permanent: true` is a 308 — irreversible cache. Acceptable in closed beta; revisit if the project goes public.

## Out of Scope (explicit)

- Renaming `components/fire-banking/*` files.
- Extracting a separate design-system package.
- Adding Analysis features in any form.
- Changing Supabase schemas, API routes, cron handlers, calculation formulas.
- Rewriting copy beyond what the prototype explicitly shows.
