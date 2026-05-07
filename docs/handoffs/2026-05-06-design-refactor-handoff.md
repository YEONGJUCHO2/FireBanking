# Fire Banking — Design Refactor Handoff (2026-05-06)

## Project state

- **Branch**: `main` (everything below is merged + pushed)
- **Latest commit**: `b2eae28` — `fix(hero): keep chevron after 만원 + add subtle label underline`
- **Tests**: `npm test` 56/56 green (one pre-existing typecheck error in `src/features/dashboard/lib/getDashboardPartnerState.test.ts:39` unchanged, out of scope)
- **Build**: `npm run build` green, 17 routes
- **Production**: https://fire-banking.vercel.app (Vercel project `prj_Qeq7ZYZ2Ry8JgZ9eJG0fq8ZfD23g` under `yeongju-chos-projects/fire-banking`)
- **Auto-deploy**: GitHub → Vercel wired; pushing to `main` triggers a prod deploy in ~36s
- **Custom domain**: `tstools.kr` registered to the team but **not yet aliased** to fire-banking. To bind: `vercel alias <prod-deploy-url> tstools.kr`

## Source of truth & references

| Doc | Purpose |
| --- | --- |
| `docs/superpowers/specs/2026-05-05-firebanking-design-refactor-design.md` | Design spec (locked, commit `f344081`) |
| `docs/superpowers/plans/2026-05-05-firebanking-design-refactor.md` | 13-task plan (locked, commit `8b71bb2`) |
| `~/Downloads/Fire-Banking-·-Claude-Design-원본/` | Claude-Design HTML/JSX prototype — **visual source of truth** |
| `~/Downloads/Fire-Banking-·-Claude-Design-원본/moqpi3rm-designer-handoff.md` | Designer route ↔ screen ↔ component map |
| `fire_couple_app_prd_v2.md` | PRD — wins on behavior when in conflict |
| `open-design/design-systems/firebanking/DESIGN.md` | Token names & OD comment-marker rule |

## What shipped (this session, 24 + ~15 follow-up commits)

### Plan tasks (Task 0 → 12) — all done
- **Task 0** Token alignment: Tailwind v4 `@theme` is the single source of design tokens; legacy A-palette (`fb-bg`, `fb-sand`, `fb-stone`, `fb-sage`, `fb-slate`, `fb-bluegray`, `fb-green*`, `fb-muted`, `fb-warning`, `fb-danger`) fully removed. Blue-tinted shadows restored. `--radius-soft` regression fixed. Kakao tokens added.
- **Task 1** `/insights` deleted + 308 redirect to `/dashboard` in `next.config.ts`
- **Task 2/3** Dashboard mobile + desktop visual passes (`screens/03-dashboard.jsx`, `screens/11-desktop-dashboard.jsx`)
- **Task 4** Assets visual pass (`screens/06b-assets.jsx`)
- **Task 5** Subscribe visual pass (`screens/06-simulator.jsx`)
- **Task 6** Onboarding admin visual pass (`screens/02-admin-onboarding.jsx`)
- **Task 7** NEW route `/onboarding/result` (FIRE result bridge from `screens/03b-result-bridge.jsx`)
- **Task 8** Invite acceptance visual pass (`screens/04-invite-accept.jsx`)
- **Task 9** NEW route `/invite/[token]/lite` (3-step spouse onboarding from `screens/05-lite-onboarding.jsx`) — **persistence deferred to R1, see "Open items"**
- **Task 10** History visual pass (`screens/07-history-tab.jsx`)
- **Task 11** Together visual pass (`screens/09-together-tab.jsx`)
- **Task 12** Settings + Auth visual pass (`screens/10-settings-tab.jsx`, `screens/01-login.jsx`)

### Iterative dashboard polish (post-task-12 user-driven)
- Top nav routes wired (`체크인` removed, `시뮬레이터` removed; only `대시보드` + `히스토리` remain)
- Settings gear icon swapped from sun-rays SVG → proper lucide outline gear; **mobile** swapped gear → user avatar circle (Google/Kakao OAuth picture via `getUserAvatar` helper)
- Logout button only in `/settings`. Removed from `/dashboard` mobile + desktop.
- Cashflow summary card moved from `/dashboard` → top of `/subscribe`
- Spouse checkin card + 배우자 초대 `AdminPartnerCard` removed from `/dashboard` (lives on `/together`)
- Hero card: `FIRE까지 남은 금액` is now `text-fb-trust` blue (single accent on the screen). Toggle pinned absolute top-right so label sits flush above number with `mt-1`. FIRE 배지 removed.
- Hero breakdown row labels renamed:
  - `FIRE 목표자산` → `목표 금액`
  - `목표 월 생활비` → `FIRE 후 생활비` (positions swapped)
  - `월 자산 증가 여력` → `모이는 돈`
  - Monthly cells (`FIRE 후 생활비`, `모이는 돈`) prefix value with small `월` → e.g. `월 300 만원`
- Tappable cells (`FIRE 계산 순자산` → `/assets`, `모이는 돈` → `/subscribe`) get **3-layer affordance**: fb-trust dot before label + decoration-fb-trust/40 underline on label text + fb-trust `›` chevron after `만원`
- `안녕하세요` greeting removed; only month label remains
- Login (`/`) and `/showcase` LoginScreenPreview unified via shared `LoginScreenContent` component. **Showcase is the source of truth** — when re-touching login, edit `LoginScreenContent` (in `landing-experience.tsx`) and both surfaces update.
- Gmail (inverse black + multi-color Google mark, "G-mail로 시작하기") + Kakao (yellow brand-locked, "카카오로 계속하기") buttons; Kakao always rendered (env gate dropped). OAuth errors surface to UI; if Supabase has no provider URL, dev fallback to `/onboarding` so designers can verify post-auth screens locally.

### Component infra
- `getUserAvatar(user)` helper in `src/features/auth/lib/getUserAvatar.ts` — derives URL/initial/alt from Google/Kakao `user_metadata`
- `LoginScreenContent` shared between live `/` and `/showcase`
- `OnboardingResultBridge` (`components/fire-banking/onboarding-result-bridge.tsx`) + matching showcase preview in a co-located `'use client'` file
- `package.json` has `typecheck` script (`tsc --noEmit`)
- Pre-existing typecheck error stays in `src/features/dashboard/lib/getDashboardPartnerState.test.ts:39` (line was already broken before this session, unrelated)

## Open items / deferred work

| Item | Where | Notes |
| --- | --- | --- |
| **Lite spouse onboarding persistence** | `app/invite/[token]/lite/lite-onboarding-client.tsx` | Visual route + form complete. `onComplete` is a `router.push("/dashboard")` placeholder. Needs server action / API route + Supabase table for spouse Lite check-in data. Marked `TODO(R1)` in source. |
| **Custom domain alias** | Vercel team settings | `tstools.kr` registered but unaliased. Run `vercel alias <deploy-url> tstools.kr` to bind. |
| **Kakao OAuth provider config** | Supabase project | `SignInButton` always shows Kakao button. Provider URL won't return without server-side OAuth config. Until then the dev-fallback redirect to `/onboarding` keeps the UX flow walkable for design verification. |
| **`/assets` snapshot wiring on `/subscribe`** | `app/subscribe/page.tsx` | Cashflow card calls `getDashboardCashflowSnapshot` and falls back to a static `cashflowFallback` of zeros (was 850/350/220/180/280; user changed to all 0 — see in-file note). When real snapshots flow in, fallback only matters for unauth/empty state. |
| **Pre-existing typecheck error** | `src/features/dashboard/lib/getDashboardPartnerState.test.ts:39` | Mock builder type mismatch. Predates this session. Build still passes; only `tsc --noEmit` flags it. |
| **`/insights` redirect (308)** | `next.config.ts` | Permanent. Acceptable in closed beta; revisit before any public launch. |
| **Mobile dashboard preview vs live `/dashboard`** | `app/dashboard/mobile/page.tsx` vs `app/dashboard/page.tsx` mobile branch | Static preview (myName=나, mock data) and live route diverge on a few details (e.g. greeting copy already removed from both). Verify any future change touches both. |

## Important workflow notes for the next session

These are saved in user-level memory (`~/.claude/projects/-Users-macmini-cho-Documents-Project-Claude-design/memory/`) too — surfaced here so you don't have to dig.

1. **Discuss design before implementing**. Visual decisions (color, background fill, affordance pattern, hierarchy) — propose 2–3 short options first, get the user's pick, then apply. Do NOT pick a direction unilaterally. The user explicitly rejected `bg-fb-trust-soft` cell tints as "짜친다" because they wanted to choose.
2. **Showcase is the source of truth for visuals**. When live page and `/showcase` mockup drift, edit so the live page matches the mockup, not the other way around.
3. **Korean responses**. User instruction file (`~/.claude/CLAUDE.md` and project memory) sets this — keep responses in Korean unless writing code/commits.
4. **Commit messages in English**. Body can include Korean labels in quotes when relevant.
5. **Cost-aware**. Don't read full prototype JSXs into context unnecessarily; don't run heavy checks on unrelated paths. Prefer `grep` for targeted lookups.
6. **No protected-route redirect tests in Playwright**. Auth coverage already lives in `tests/e2e/r0-admin-solo.spec.ts`. Per-screen visual specs only smoke through `/showcase`.
7. **Wrapper `<div>` for OD markers** when underlying component (e.g. `PageCanvas`, `PhoneMockup`, `Card`, `Button`) doesn't forward `...rest` props. Accepted pattern.
8. **Don't `co-authored-by` trailers** on commits.
9. **Forbidden tokens** (regression if reintroduced): `fb-bg`, `fb-surface`, `fb-sand`, `fb-stone`, `fb-sage`, `fb-slate`, `fb-bluegray`, `fb-green`, `fb-green-900`, `fb-muted`, `fb-subtle`, `fb-warning`, `fb-danger`. Run `grep -rEn "fb-(muted|subtle|sand|stone|sage|slate|bluegray|surface|bg|green|warning|danger)[a-z0-9/-]*" app components src` after any visual edit.

## Quick refs

### Routes (all auth-protected unless noted)

| Route | What | Auth |
| --- | --- | --- |
| `/` | Landing + login (Gmail/Kakao) | unauth |
| `/auth/callback` | Supabase OAuth callback | unauth |
| `/showcase` | All screen mockups in phone frames | unauth |
| `/design-system` | Trust palette + typo + component catalog | unauth |
| `/dashboard` | Home (mobile + desktop branches via `lg:hidden`/`lg:block`) | gated |
| `/dashboard/mobile` | Static design preview of mobile dashboard | unauth (renders without Supabase) |
| `/onboarding` | 4-input admin onboarding stepper | gated |
| `/onboarding/result` | NEW — first FIRE result bridge | gated |
| `/invite/[token]` | Spouse invite acceptance | unauth (token-validated) |
| `/invite/[token]/lite` | NEW — spouse 3-input lite onboarding | unauth (token-validated; persistence deferred) |
| `/subscribe` | FIRE 생활비 조정기 + cashflow summary at top | gated |
| `/assets` | FIRE 자산 진단 | gated |
| `/history` | Monthly snapshot history | gated |
| `/together` | Spouse connection + checkin | gated |
| `/settings` | Profile + data sharing + sign out | gated |
| `/insights` | 308 → `/dashboard` (legacy) | n/a |

### Key files

| File | Why |
| --- | --- |
| `app/globals.css` | Token authority — `@theme` block. Edit here for colors/radii/shadows. |
| `tailwind.config.ts` | Just `content` globs — do NOT add `theme.extend`; it shadows `@theme`. |
| `components/fire-banking/landing-experience.tsx` | `LoginScreenContent` shared by `/` and `/showcase` LoginScreenPreview |
| `components/fire-banking/networth-hero.tsx` | Mobile dashboard hero card + breakdown |
| `components/fire-banking/desktop-dashboard.tsx` | Full PC dashboard composition |
| `components/fire-banking/screen-mockups.tsx` | All `/showcase` phone-frame previews |
| `src/features/auth/lib/getUserAvatar.ts` | OAuth metadata → avatar URL/initial helper |

### Common commands

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking

npm run dev              # local dev (port 3000)
npm test                 # vitest, expect 56/56
npm run build            # next build, expect 17 routes
npm run typecheck        # tsc --noEmit, 1 pre-existing error allowed
npm run test:e2e         # Playwright (port 3100, see playwright.config.ts)

# Token leak check after any visual edit
grep -rEn "fb-(muted|subtle|sand|stone|sage|slate|bluegray|surface|bg|green|warning|danger)[a-z0-9/-]*" app components src

# Vercel
vercel ls                # deployment list
vercel inspect <url>     # deployment detail
vercel logs <url>        # runtime logs
```

### Repo

- GitHub: https://github.com/YEONGJUCHO2/FireBanking
- Default branch: `main`
- Last merged PR: #3 — design-refactor (`299ed04`)
