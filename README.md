# Fire Banking

Closed beta implementation for the FIRE couple app.

## Product Scope

- Lead-partner onboarding with a fast first FIRE result
- Spouse invite and Lite check-in flow
- Korean-context monthly finance inputs
- FIRE projection using one shared calculation model
- Monthly snapshot persistence
- Home dashboard for the current monthly result
- FIRE living expense adjuster
- FIRE asset diagnosis for investable assets and investment-linked loans
- Closed-beta trust hardening: no fake settings links, no demo-only analysis tab, clear assumptions

## Documentation Map

- `fire_couple_app_prd_v2.md` is the canonical product spec. If another document disagrees with it, the PRD wins.
- `docs/designer-handoff.md` is the current designer handoff for the upcoming app refactor. It intentionally documents screen structure, component requirements, states, and implementation constraints only; visual tone-and-manner direction is out of scope.
- `docs/handoffs/` stores JSON handoffs for continuing work in new Codex sessions. `docs/handoffs/index.json` is the cumulative handoff index.
- `docs/superpowers/specs/` and `docs/superpowers/plans/` are historical implementation notes. They are useful for context, but they are not the source of truth for current product scope.
- `memory.md` is an old session memory file. It is retained only as archive context and should not be used as current project status.
- `.gstack/` and `.superpowers/` are local QA/brainstorming artifacts and are intentionally ignored by git.

## Current Development State

This branch is in active closed-beta implementation. The main implemented or partially implemented surfaces are:

- App entry, auth callback, Admin onboarding, first FIRE result bridge, dashboard, history, together, settings, invite acceptance, FIRE living expense adjuster, and FIRE asset diagnosis.
- Dashboard data now combines cashflow snapshot state, asset diagnosis inputs, and partner state.
- FIRE living expense adjuster supports fixed expense, variable expense, buffer, saved draft state, and explicit apply-to-dashboard behavior.
- FIRE asset diagnosis separates FIRE reflected investment assets from restricted/future assets and investment-linked loans.
- Tests exist across dashboard, onboarding, invite, assets, subscribe, auth, couple, and cron jobs.

Known document cleanup status:

- The PRD remains canonical.
- Designer handoff has been revised for system/screen/component handoff only.
- Historical superpowers plans/specs are intentionally retained as implementation history, not deleted.
- Old `.gstack` handoffs are not the current handoff location; current JSON handoffs live under `docs/handoffs/`.

## Closed Beta Must Not Ship With

- Hard-coded demo names, history, or analysis numbers as if they were real user data
- A separate `분석` tab with stale or duplicate FIRE calculations
- Clickable-looking settings rows that do not work
- FIRE numbers calculated differently across onboarding, dashboard, history, and sharing

## Environment

Copy `.env.example` to `.env.local` and fill:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
KIWOOM_APP_KEY=
KIWOOM_APP_SECRET=
KIWOOM_BASE_URL=https://api.kiwoom.com
```

`KIWOOM_APP_KEY` and `KIWOOM_APP_SECRET` enable live domestic instrument search and daily close-price sync.
Without them, the asset screen falls back to the non-live alpha behavior.

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
