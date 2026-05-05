# FireBanking Design Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the FireBanking Next.js app at `/Users/macmini-cho/Documents/Project/FireBanking` into 1:1 visual alignment with the Claude-Design HTML prototype, complete the unfinished palette migration, ship the two new screens (onboarding result bridge, Lite spouse onboarding), and remove the dead `/insights` route.

**Architecture:** Tailwind v4 `@theme` becomes the single source of design tokens; the legacy `tailwind.config.ts` color/shadow blocks are removed so they stop shadowing it. Per-screen visual passes map prototype `screens/NN-*.jsx` files 1:1 onto existing `app/<route>/page.tsx` files, keeping all Supabase data flows untouched. New screens land as new App Router routes. `/showcase` is the visual smoke surface for Playwright (it imports every screen preview without auth gating).

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4 (`@theme` in `globals.css`), Supabase, Vitest + Testing Library, Playwright (`tests/e2e/`).

**Spec:** [`docs/superpowers/specs/2026-05-05-firebanking-design-refactor-design.md`](../specs/2026-05-05-firebanking-design-refactor-design.md) (commit `f344081`)

**Sources of truth, in order:**
1. `fire_couple_app_prd_v2.md` — wins on behavior
2. `~/Downloads/Fire-Banking-·-Claude-Design-원본/` (entry: `firebanking-claude-design-updated-30.html`) — wins on visual treatment
3. `~/Downloads/Fire-Banking-·-Claude-Design-원본/ds/colors_and_type.css` — exact token values
4. `~/Downloads/Fire-Banking-·-Claude-Design-원본/moqpi3rm-designer-handoff.md` — route ↔ screen ↔ component map
5. `open-design/design-systems/firebanking/DESIGN.md` — token names and OD-marker rules

---

## File Structure

### Created

| Path | Responsibility |
| --- | --- |
| `app/onboarding/result/page.tsx` | Server route for onboarding result bridge (one-time first FIRE result + invite CTA) |
| `app/invite/[token]/lite/page.tsx` | Server route for Lite spouse three-input flow |
| `components/fire-banking/onboarding-result-bridge.tsx` | Bridge composition (FireHeroCard + remaining + dual CTA) |
| `components/fire-banking/onboarding-result-bridge.test.tsx` | Vitest unit test for bridge |
| `tests/e2e/design-tokens.spec.ts` | Playwright smoke for `/showcase` and `/design-system` (post-token-cleanup) |
| `tests/e2e/dashboard-visual.spec.ts` | Playwright smoke for dashboard preview in `/showcase` |
| `tests/e2e/assets-visual.spec.ts` | Playwright smoke for assets preview |
| `tests/e2e/subscribe-visual.spec.ts` | Playwright smoke for subscribe preview |
| `tests/e2e/onboarding-visual.spec.ts` | Playwright smoke for onboarding preview |
| `tests/e2e/onboarding-result-visual.spec.ts` | Playwright smoke for new result bridge preview |
| `tests/e2e/invite-visual.spec.ts` | Playwright smoke for invite preview |
| `tests/e2e/lite-onboarding-visual.spec.ts` | Playwright smoke for lite onboarding preview |
| `tests/e2e/history-visual.spec.ts` | Playwright smoke for history preview |
| `tests/e2e/together-visual.spec.ts` | Playwright smoke for together preview |
| `tests/e2e/settings-visual.spec.ts` | Playwright smoke for settings preview |

### Modified

| Path | Responsibility change |
| --- | --- |
| `tailwind.config.ts` | Strip `theme.extend.colors`/`borderRadius`/`boxShadow`; keep only `content` |
| `app/globals.css` | Update `@theme` block to align with `ds/colors_and_type.css` and DESIGN.md (blue-tinted shadows, `1.125rem`/`0.875rem` radii, kakao tokens) |
| `next.config.ts` | Add `redirects()` returning `/insights` → `/dashboard` (308) |
| `app/showcase/page.tsx` | Token migration; add missing screen previews (Assets, History, Together, Settings, ResultBridge) |
| `app/design-system/page.tsx` | Rewrite color/keyword/component sample to document the new Trust palette |
| `app/auth/page.tsx` (or whatever the entry route renders) | Visual pass against `screens/01-login.jsx`; preserve Kakao brand-locked button |
| `app/onboarding/page.tsx` | Visual pass against `screens/02-admin-onboarding.jsx` |
| `app/dashboard/page.tsx` | Visual pass for desktop branch against `screens/11-desktop-dashboard.jsx` |
| `app/dashboard/mobile/page.tsx` | Visual pass against `screens/03-dashboard.jsx` |
| `app/invite/[token]/page.tsx` | Visual pass against `screens/04-invite-accept.jsx` |
| `app/subscribe/page.tsx` | Visual pass against `screens/06-simulator.jsx` |
| `app/assets/page.tsx` | Visual pass against `screens/06b-assets.jsx` |
| `app/history/page.tsx` | Visual pass against `screens/07-history-tab.jsx` |
| `app/together/page.tsx` | Visual pass against `screens/09-together-tab.jsx` |
| `app/settings/page.tsx` | Visual pass against `screens/10-settings-tab.jsx` |
| `components/fire-banking/screen-mockups.tsx` | Add `AssetsScreenPreview`, `HistoryScreenPreview`, `TogetherScreenPreview`, `SettingsScreenPreview`, `ResultBridgeScreenPreview` |
| `components/fire-banking/index.ts` | Export new previews + `OnboardingResultBridge` |
| Various `components/fire-banking/*.tsx` | Apply prototype-aligned spacing/structure as discovered per task |

### Deleted

| Path | Reason |
| --- | --- |
| `app/insights/page.tsx` | Dead redirect; closed beta IA forbids Analysis tab |
| `app/insights/page.test.tsx` | Tests for deleted route |
| `app/insights/` (directory) | Empty after files removed |

---

## Universal Visual-Pass Procedure (referenced by Tasks 2–12)

Per-screen tasks all follow this shape. Each task instantiates the procedure with its own paths, marker IDs, and test code (provided inline in the task — no cross-references).

**Visual treatment scope:**
- Layout, grid, spacing, vertical rhythm, hero treatment, secondary card grid
- Typography weight/size against the prototype
- Token application — colors, shadows, radii (only the tokens defined in `globals.css @theme`)
- Korean copy as it appears in the prototype (microcopy nudges allowed; do not rewrite tone)
- Status pill placement and color semantics (`fb-positive`/`fb-cautionary`/`fb-negative` only)
- Single primary CTA per screen rule (`bg-fb-trust text-white`)
- OD comment markers (`data-screen-label` on container; `data-od-id` on every component instance)

**Out of scope per task:**
- Supabase data fetch logic, calculations, schema, API routes
- Component renames or file moves
- New abstractions beyond what the screen requires
- Marketing copy rewrites

**OD marker rules** (DESIGN.md §10):
- Top-level screen container: `data-screen-label="<screen>"` (kebab-case)
- Component instance: `data-od-id="<kebab-name>"`, suffix `-1`, `-2`, … when repeated
- IDs derive from semantic role and stay stable across regenerations

**Token quick-reference** (post-Task-0 state):
- Surface: `bg-fb-page` `bg-fb-card` `bg-fb-card-alt` `bg-fb-card-mute`
- Ink: `text-fb-ink` `text-fb-ink-2` `text-fb-ink-3` `text-fb-ink-4`
- Lines: `border-fb-line` `border-fb-line-strong` `border-fb-line-soft`
- Trust: `bg-fb-trust` `text-fb-trust` `bg-fb-trust-soft` `text-fb-trust-ink` `bg-fb-trust-strong` (hover)
- Status: `fb-positive`/`fb-positive-soft`/`fb-positive-ink`, `fb-cautionary*`, `fb-negative*`
- Brand-locked: `bg-fb-kakao text-fb-kakao-ink` (Kakao login only)
- Radii: `rounded-card` (1.125rem), `rounded-soft`/`rounded-button` (0.875rem), `rounded-[24px]` (hero), `rounded-full` (pill)
- Shadows: `shadow-card`, `shadow-soft`, `shadow-elevated`

**Forbidden tokens (post-Task-0):** `fb-bg`, `fb-surface`, `fb-sand`, `fb-stone`, `fb-sage`, `fb-slate`, `fb-bluegray`, `fb-green`, `fb-green-900`, `fb-muted`, `fb-subtle`, `fb-warning`, `fb-danger`. These are removed from the palette. Any reappearance is a regression.

---

## Task 0: Token Alignment + Showcase / Design-System Rewrite

**Files:**
- Modify: `tailwind.config.ts` (full rewrite)
- Modify: `app/globals.css` (patch `@theme` block)
- Modify: `app/showcase/page.tsx` (token migration only — structure stays)
- Modify: `app/design-system/page.tsx` (full rewrite — currently documents old palette)

- [ ] **Step 1: Read the prototype's authoritative token file**

```bash
cat "/Users/macmini-cho/Downloads/Fire-Banking-·-Claude-Design-원본/ds/colors_and_type.css"
```

Confirm the exact hex values and shadow recipes. Use these as the source of truth where they conflict with the in-app `globals.css`. (`ds/colors_and_type.css` is the prototype's compiled token sheet — match it, do not invent new values.)

- [ ] **Step 2: Replace `tailwind.config.ts`**

Write the entire file with this content:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
```

The legacy `theme.extend.colors.fb`, `borderRadius`, and `boxShadow` blocks are removed entirely. Tailwind v4 reads tokens from `@theme` in `globals.css`; the v3-style blocks were shadowing the new palette.

- [ ] **Step 3: Patch `app/globals.css` `@theme` block**

In the existing `@theme { … }` block, change these declarations to match `ds/colors_and_type.css` and DESIGN.md:

```css
  --radius-card: 1.125rem;          /* was 20px */
  --radius-button: 0.875rem;        /* was 12px */
  --radius-button-lg: 0.875rem;     /* keep at 14px-equivalent */

  --shadow-card: 0 10px 30px rgba(0, 102, 255, 0.06);     /* was none */
  --shadow-soft: 0 18px 60px rgba(0, 102, 255, 0.10);     /* was grey-tinted */
  --shadow-elevated: 0 28px 90px rgba(0, 102, 255, 0.14); /* was grey-tinted */
  --shadow-inner-soft: inset 0 1px 0 rgba(255, 255, 255, 0.65);
  --shadow-trust-glow: 0 4px 12px rgba(0, 102, 255, 0.28), 0 0 0 6px rgba(0, 102, 255, 0.10);
```

Add (if not present) Kakao tokens at the end of the `@theme` block:

```css
  --color-fb-kakao: #f8d75b;
  --color-fb-kakao-ink: #191919;
```

Leave every other declaration in the `@theme` block untouched.

- [ ] **Step 4: Add a `typecheck` npm script (one-time repo improvement)**

Open `package.json` and add the line marked `+` inside `scripts`:

```diff
   "scripts": {
     "dev": "next dev",
     "build": "next build",
     "start": "next start",
     "lint": "eslint .",
+    "typecheck": "tsc --noEmit",
     "test": "vitest run",
     "test:watch": "vitest",
     "test:e2e": "playwright test"
   },
```

Then verify tokens compile:

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && npm run typecheck
```

Expected: no errors. If errors mention missing colors, the residual A-palette in `app/showcase` and `app/design-system` is the source — Steps 5 and 6 fix them.

- [ ] **Step 5: Rewrite `app/design-system/page.tsx`**

The file currently documents the old A palette (sand/stone/sage/etc.) literally. Replace its content so it documents the Trust palette per DESIGN.md §2. Use this as the new file:

```tsx
import {
  BrandLockup,
  Button,
  Card,
  FireHeroCard,
  MetricCard,
  MoneyInputRow,
  PageCanvas,
  StateMetricExamples,
  StatusPill,
  TextField,
} from '@/components/fire-banking'
import { Icon, type IconName } from '@/components/fire-banking/icons'

const keywords: Array<{ label: string; icon: IconName }> = [
  { label: '차분함', icon: 'leaf' },
  { label: '신뢰감', icon: 'shield' },
  { label: '함께 보는 숫자', icon: 'users' },
  { label: '월간 리추얼', icon: 'calendar' },
  { label: '장기적 관점', icon: 'mountain' },
  { label: '부담 없는 참여', icon: 'heart' },
]

const surfaces: Array<[string, string, string]> = [
  ['Page', '#FAFAFA', 'bg-fb-page'],
  ['Card', '#FFFFFF', 'bg-fb-card'],
  ['Card Alt', '#F7F7F8', 'bg-fb-card-alt'],
  ['Card Mute', '#F4F4F5', 'bg-fb-card-mute'],
]

const trust: Array<[string, string, string]> = [
  ['Trust', '#0066FF', 'bg-fb-trust'],
  ['Trust Strong', '#005EEB', 'bg-fb-trust-strong'],
  ['Trust Soft', '#EAF2FE', 'bg-fb-trust-soft'],
]

const status: Array<[string, string, string]> = [
  ['Positive', '#00A638', 'bg-fb-positive'],
  ['Cautionary', '#FF8A1F', 'bg-fb-cautionary'],
  ['Negative', '#FF4242', 'bg-fb-negative'],
]

export default function DesignSystemPage() {
  return (
    <PageCanvas className="max-w-7xl mx-auto" data-screen-label="design-system">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between" data-od-id="design-system-header">
        <div>
          <BrandLockup tagline={false} />
          <p className="mt-3 text-sm text-fb-ink-2">부부가 함께 순자산과 경제적 자유 진척을 확인하는 앱</p>
        </div>
        <Button href="/showcase" variant="secondary" data-od-id="cta-secondary">화면 쇼케이스 보기</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr_1fr]">
        <Card className="p-6" data-od-id="ds-keywords">
          <h2 className="text-lg font-bold tracking-normal">1. 브랜드 무드 / 키워드</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {keywords.map((keyword) => (
              <div
                key={keyword.label}
                className="flex items-center gap-3 rounded-soft border border-fb-line bg-fb-card-alt p-4 text-sm font-bold"
              >
                <Icon name={keyword.icon} className="size-5 text-fb-trust" />
                {keyword.label}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6" data-od-id="ds-palette">
          <h2 className="text-lg font-bold tracking-normal">2. 컬러 팔레트</h2>
          <div className="mt-5 space-y-5">
            <div>
              <p className="text-xs font-bold text-fb-ink-2">Surface</p>
              <div className="mt-2 grid grid-cols-4 gap-3">
                {surfaces.map(([label, hex, cls]) => (
                  <div key={label}>
                    <div className={`${cls} h-16 rounded-soft border border-fb-line`} />
                    <p className="mt-2 text-xs font-bold">{label}</p>
                    <p className="text-[11px] text-fb-ink-3">{hex}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-fb-ink-2">Trust (single accent)</p>
              <div className="mt-2 grid grid-cols-3 gap-3">
                {trust.map(([label, hex, cls]) => (
                  <div key={label}>
                    <div className={`${cls} h-16 rounded-soft border border-fb-line`} />
                    <p className="mt-2 text-xs font-bold">{label}</p>
                    <p className="text-[11px] text-fb-ink-3">{hex}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-fb-ink-2">Status (semantic only)</p>
              <div className="mt-2 grid grid-cols-3 gap-3">
                {status.map(([label, hex, cls]) => (
                  <div key={label}>
                    <div className={`${cls} h-16 rounded-soft border border-fb-line`} />
                    <p className="mt-2 text-xs font-bold">{label}</p>
                    <p className="text-[11px] text-fb-ink-3">{hex}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6" data-od-id="ds-typography">
          <h2 className="text-lg font-bold tracking-normal">3. 타이포그래피</h2>
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs text-fb-ink-3">Hero number</p>
              <p className="text-4xl font-black tracking-tight">2042년 8월</p>
            </div>
            <div>
              <p className="text-xs text-fb-ink-3">Section title</p>
              <p className="text-xl font-bold tracking-normal">FIRE 계산 순자산</p>
            </div>
            <div>
              <p className="text-xs text-fb-ink-3">Body</p>
              <p className="text-sm leading-6">우리가 함께 가는 경제적 자유</p>
            </div>
            <div className="rounded-soft bg-fb-card-alt p-4 text-sm text-fb-ink-2">
              Pretendard 100~900 weights · Korean 우선
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="p-6" data-od-id="ds-components">
          <h2 className="text-lg font-bold tracking-normal">4. 핵심 컴포넌트</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Button className="w-full">저장하기</Button>
              <Button variant="secondary" className="w-full">취소</Button>
              <Button variant="soft" className="w-full">지난달과 같아요</Button>
            </div>
            <div className="space-y-4">
              <TextField label="텍스트 필드" placeholder="항목명을 입력하세요" />
              <MoneyInputRow label="숫자 입력" value={12345} />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <StatusPill label="정상" status="positive" />
            <StatusPill label="주의" status="caution" />
            <StatusPill label="계산 불가" status="unavailable" />
          </div>
        </Card>

        <Card className="p-6" data-od-id="ds-numbers">
          <h2 className="text-lg font-bold tracking-normal">5. 수치 표현 계층</h2>
          <div className="mt-5 space-y-4">
            <FireHeroCard dateLabel="2042년 8월" distanceLabel="17년 3개월 후" compact />
            <StateMetricExamples />
            <div className="rounded-soft bg-fb-card-mute p-4 text-sm leading-6 text-fb-ink-2">
              현재 입력 기준으로는 목표 도달 시점을 계산하기 어려워요.
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6" data-od-id="ds-lead">
          <h2 className="text-lg font-bold">6. 리드 파트너 입력</h2>
          <p className="mt-2 text-sm leading-6 text-fb-ink-2">
            더 많은 항목과 세부 입력 제공. 정확한 수치를 기반으로 한 참고 지표 제공.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <MetricCard title="총 자산" value="입력 후 표시" />
            <MetricCard title="저축률" value="계산 대기" variant="positive" />
          </div>
        </Card>
        <Card className="p-6" data-od-id="ds-lite">
          <h2 className="text-lg font-bold">배우자 간단 입력</h2>
          <p className="mt-2 text-sm leading-6 text-fb-ink-2">
            간단한 입력만으로 참여. 부담 없는 질문과 안심 문구 중심.
          </p>
          <div className="mt-5 space-y-3">
            <MoneyInputRow label="내 세후 월수입" value={0} soft />
            <Button className="w-full" variant="soft">정확하지 않아도 괜찮아요</Button>
          </div>
        </Card>
      </div>
    </PageCanvas>
  )
}
```

If `MetricCard` does not accept `variant="positive"`, drop the prop (some component APIs may differ — keep the structure, omit unsupported props rather than inventing them).

- [ ] **Step 6: Migrate `app/showcase/page.tsx` tokens**

In the existing file, replace the residual A-palette occurrences in place:
- `text-fb-muted` → `text-fb-ink-2`
- `bg-fb-green` → `bg-fb-trust`
- `text-fb-green` → `text-fb-trust`

Do not change layout or structure — only the token classes. The file has roughly 4–6 such occurrences in headers, captions, and badges.

Add `data-screen-label="showcase"` to the top `PageCanvas`. Add `data-od-id` to each `PhoneMockup` instance and the `DesktopDashboard` section header.

- [ ] **Step 7: Verify no residual A-palette remains**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && grep -rEn "fb-(muted|subtle|sand|stone|sage|slate|bluegray|surface|bg|green|warning|danger)[a-z0-9/-]*" app components 2>/dev/null
```

Expected: empty output. Any remaining occurrence is a leak — fix it before committing.

- [ ] **Step 8: Run typecheck, unit tests, build**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && npm run typecheck && npm test && npm run build
```

Expected: all pass. If `npm run build` warns about unused tokens or unknown classes, the residual grep missed something.

- [ ] **Step 9: Commit**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && git add tailwind.config.ts app/globals.css app/showcase/page.tsx app/design-system/page.tsx
git commit -m "$(cat <<'EOF'
refactor(design-tokens): align Tailwind v4 @theme with DESIGN.md and prototype

Strip legacy A-palette and grey shadows from tailwind.config.ts so the v4
@theme block in globals.css becomes the single source of design tokens.
Restore blue-tinted shadows, fix radius drift, add Kakao tokens, and
rewrite app/design-system to document the Trust palette. app/showcase
keeps its structure but loses the A-palette class names.
EOF
)"
```

---

## Task 1: `/insights` Cleanup

**Files:**
- Delete: `app/insights/page.tsx`
- Delete: `app/insights/page.test.tsx`
- Delete: `app/insights/` (directory)
- Modify: `next.config.ts`

- [ ] **Step 1: Read current `next.config.ts`**

```bash
cat /Users/macmini-cho/Documents/Project/FireBanking/next.config.ts
```

Expected current content:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

- [ ] **Step 2: Replace `next.config.ts` with redirect**

Write:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/insights",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 3: Delete the `/insights` route**

```bash
rm /Users/macmini-cho/Documents/Project/FireBanking/app/insights/page.tsx
rm /Users/macmini-cho/Documents/Project/FireBanking/app/insights/page.test.tsx
rmdir /Users/macmini-cho/Documents/Project/FireBanking/app/insights
```

- [ ] **Step 4: Verify no remaining references to `/insights`**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && grep -rn "/insights" app components lib 2>/dev/null
```

Expected: empty.

- [ ] **Step 5: Run typecheck, tests, build**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && npm run typecheck && npm test && npm run build
```

Expected: all pass. If `page.test.tsx` was the only thing importing a stub module, no other test should break.

- [ ] **Step 6: Manual redirect smoke (optional, only if dev server is up)**

```bash
curl -sI http://localhost:3100/insights
```

Expected: `HTTP/1.1 308` and `location: /dashboard`.

- [ ] **Step 7: Commit**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && git add next.config.ts app/insights
git commit -m "refactor(routes): remove /insights and redirect to /dashboard

Closed beta IA forbids an Analysis tab. The route was a 4-line redirect
with zero incoming references; replace it with a 308 in next.config.ts."
```

---

## Tasks 2–12: Per-Screen Visual Passes

Each task below applies the Universal Visual-Pass Procedure to one screen. Tasks are independent; work them in order or in parallel (separate worktrees per PR).

---

## Task 2: Dashboard (Mobile) Visual Pass

**Files:**
- Read: `~/Downloads/Fire-Banking-·-Claude-Design-원본/screens/03-dashboard.jsx`
- Modify: `app/dashboard/mobile/page.tsx` (existing)
- Modify (as needed): `components/fire-banking/dashboard-fire-overview.tsx`, `fire-hero-card.tsx`, `fire-timeline.tsx`, `metric-card.tsx`, `cashflow-summary.tsx`, `cashflow-strip.tsx`, `checkin-row.tsx`, `bottom-nav.tsx`
- Modify: `components/fire-banking/screen-mockups.tsx` (refresh `DashboardScreenPreview`)
- Test: `tests/e2e/dashboard-visual.spec.ts` (new)

- [ ] **Step 1: Read prototype source**

```bash
cat "/Users/macmini-cho/Downloads/Fire-Banking-·-Claude-Design-원본/screens/03-dashboard.jsx"
```

Note the visual treatment: hero card style, FIRE timeline shape with the fire GIF at the 100% end, the secondary 2-up metric grid, the cashflow summary block, and the spouse check-in card behavior.

- [ ] **Step 2: Read current implementation**

```bash
cat /Users/macmini-cho/Documents/Project/FireBanking/app/dashboard/mobile/page.tsx
cat /Users/macmini-cho/Documents/Project/FireBanking/components/fire-banking/dashboard-fire-overview.tsx
cat /Users/macmini-cho/Documents/Project/FireBanking/components/fire-banking/fire-timeline.tsx
cat /Users/macmini-cho/Documents/Project/FireBanking/components/fire-banking/fire-hero-card.tsx
```

- [ ] **Step 3: Apply visual pass**

Adopt the prototype's layout, typography, spacing, hero treatment, and copy placement. Keep all Supabase data flows. Specifically:
- Hero `FireHeroCard` uses `rounded-[24px] shadow-elevated` (DESIGN.md §4)
- `FireTimeline` keeps the existing animated fire GIF source `https://em-content.zobj.net/source/animated-noto-color-emoji/356/fire_1f525.gif` at the 100% end (handoff Dashboard requirement)
- Timeline must render 0%, partial, 100%, over-target clamped states without label overlap
- Spouse check-in card hides entirely when Lite input is complete (handoff state rule)
- Single primary CTA per screen; secondary metrics in 2-up grid
- Bottom nav at 64px fixed bottom; `pb-20` content safe area

- [ ] **Step 4: Apply OD markers**

In `app/dashboard/mobile/page.tsx`, add to the top container:

```tsx
data-screen-label="dashboard"
```

In the children, add:
- `data-od-id="hero-fire"` on `FireHeroCard`
- `data-od-id="fire-timeline"` on `FireTimeline`
- `data-od-id="metric-net-worth"` on the FIRE-reflected-net-worth `MetricCard`
- `data-od-id="metric-fire-net-worth"` on the FIRE-target `MetricCard`
- `data-od-id="metric-monthly-growth"` on the monthly-growth `MetricCard`
- `data-od-id="metric-time-to-fire"` on the time-to-FIRE `MetricCard` (or unavailable state)
- `data-od-id="cashflow-summary"` on `CashflowSummary`
- `data-od-id="checkin-row"` on `CheckinRow`
- `data-od-id="spouse-card"` on the spouse card (whichever variant renders)
- `data-od-id="entry-subscribe"` on the subscribe entry card
- `data-od-id="entry-assets"` on the assets entry card
- `data-od-id="bottom-nav"` on `BottomNav`

- [ ] **Step 5: Refresh `DashboardScreenPreview` in `screen-mockups.tsx`**

Open `components/fire-banking/screen-mockups.tsx`, find `DashboardScreenPreview`, and update the mock content to mirror the new visual treatment. The preview is mock-data only — no Supabase. Keep its props interface stable so `app/showcase/page.tsx` still works.

- [ ] **Step 6: Write Playwright visual smoke test**

Create `tests/e2e/dashboard-visual.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test.describe("dashboard visual smoke", () => {
  test("dashboard preview mounts in showcase", async ({ page }) => {
    await page.goto("/showcase");
    const preview = page.locator('[data-od-id="phone-mockup-dashboard"]');
    await expect(preview).toBeVisible();
    await preview.screenshot({ path: "test-results/dashboard-preview.png" });
  });

  test("protected dashboard redirects unauthenticated user home", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL("/");
  });
});
```

If the showcase preview wrapper doesn't yet have `data-od-id="phone-mockup-dashboard"`, add it in Step 5 when refreshing the preview.

- [ ] **Step 7: Run typecheck, unit tests, build**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && npm run typecheck && npm test && npm run build
```

- [ ] **Step 8: Run Playwright spec**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && npm run test:e2e --grep "dashboard visual"
```

Expected: both tests pass; screenshot artifact produced under `test-results/`.

- [ ] **Step 9: Commit**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && git add app/dashboard/mobile components/fire-banking tests/e2e/dashboard-visual.spec.ts
git commit -m "refactor(dashboard-mobile): align with Claude-Design prototype 03-dashboard

Apply prototype layout, hero treatment with fire GIF at FIRE end, 2-up
metric grid, cashflow strip, OD markers, and Playwright visual smoke."
```

---

## Task 3: Dashboard (Desktop) Visual Pass

**Files:**
- Read: `~/Downloads/Fire-Banking-·-Claude-Design-원본/screens/11-desktop-dashboard.jsx`
- Modify: `app/dashboard/page.tsx`
- Modify: `components/fire-banking/desktop-dashboard.tsx`
- Modify: `components/fire-banking/screen-mockups.tsx` (refresh `DesktopDashboard` consumer in showcase)
- Test: extend `tests/e2e/dashboard-visual.spec.ts` (do not create a second file)

- [ ] **Step 1: Read prototype**

```bash
cat "/Users/macmini-cho/Downloads/Fire-Banking-·-Claude-Design-원본/screens/11-desktop-dashboard.jsx"
```

- [ ] **Step 2: Read current implementation**

```bash
cat /Users/macmini-cho/Documents/Project/FireBanking/app/dashboard/page.tsx
cat /Users/macmini-cho/Documents/Project/FireBanking/components/fire-banking/desktop-dashboard.tsx
```

- [ ] **Step 3: Apply visual pass**

Adopt the prototype's desktop grid: 2-column main grid (max ~1200px), hero numbers 40–48px, horizontal padding 32–48px, sidebar or top tabs in place of bottom nav. Keep the same FIRE-graph requirements (fire GIF at 100%, all four state branches).

- [ ] **Step 4: Apply OD markers**

On the top `DesktopDashboard` container:

```tsx
data-screen-label="dashboard-desktop"
```

Children: same `data-od-id` semantic names as Task 2 (`hero-fire`, `fire-timeline`, `metric-net-worth`, etc.) — semantic IDs stay stable across viewports.

- [ ] **Step 5: Extend Playwright spec**

Append to `tests/e2e/dashboard-visual.spec.ts`:

```ts
test("desktop dashboard preview mounts in showcase", async ({ page }) => {
  await page.goto("/showcase");
  const desktop = page.locator('[data-od-id="desktop-dashboard"]');
  await expect(desktop).toBeVisible();
  await desktop.screenshot({ path: "test-results/dashboard-desktop-preview.png" });
});
```

In `app/showcase/page.tsx`, ensure the `<DesktopDashboard />` instance is wrapped in `<section data-od-id="desktop-dashboard">…</section>` (already wrapped in a `<section>` per current code — just add the marker).

- [ ] **Step 6: Run typecheck, tests, Playwright**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && npm run typecheck && npm test && npm run build && npm run test:e2e --grep "dashboard visual"
```

- [ ] **Step 7: Commit**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && git add app/dashboard/page.tsx components/fire-banking/desktop-dashboard.tsx app/showcase/page.tsx tests/e2e/dashboard-visual.spec.ts
git commit -m "refactor(dashboard-desktop): align with Claude-Design prototype 11-desktop-dashboard"
```

---

## Task 4: Assets Visual Pass

**Files:**
- Read: `~/Downloads/Fire-Banking-·-Claude-Design-원본/screens/06b-assets.jsx` (580 LOC — biggest screen)
- Modify: `app/assets/page.tsx`
- Modify (as needed): `components/fire-banking/*.tsx` for any assets-specific cards/rows
- Modify: `components/fire-banking/screen-mockups.tsx` (add `AssetsScreenPreview`)
- Modify: `app/showcase/page.tsx` (add `<PhoneMockup label="자산"><AssetsScreenPreview /></PhoneMockup>`)
- Modify: `components/fire-banking/index.ts` (export `AssetsScreenPreview`)
- Test: `tests/e2e/assets-visual.spec.ts` (new)

- [ ] **Step 1: Read prototype**

```bash
cat "/Users/macmini-cho/Downloads/Fire-Banking-·-Claude-Design-원본/screens/06b-assets.jsx"
```

This is the largest prototype screen. Note the top module formula display, the four asset groups (FIRE-reflected investment, restricted/future, reference, investment-linked loans, plus excluded-liabilities when present), and the per-row interactions (search, add/edit/delete, manual US-listed valuation assist).

- [ ] **Step 2: Read current implementation**

```bash
cat /Users/macmini-cho/Documents/Project/FireBanking/app/assets/page.tsx
ls /Users/macmini-cho/Documents/Project/FireBanking/app/assets
```

- [ ] **Step 3: Apply visual pass**

Top module renders the formula `FIRE 계산 순자산 = 즉시 운용 가능 투자자산 − 투자 연계 부채` (handoff §"FIRE Asset Diagnosis"). Keep the same inclusion/exclusion rule as `/dashboard`. Each asset group is a `Card` with `rounded-card shadow-card`, group header in `text-fb-ink` Bold 700, rows in dense table style (right-aligned numbers, `text-fb-ink` for values, `text-fb-ink-2` for labels, `border-fb-line-soft` separators, no zebra rows). Liability section uses `fb-negative` semantically only when amounts are present.

- [ ] **Step 4: Apply OD markers**

```tsx
// container
data-screen-label="assets"
// children
data-od-id="hero-net-worth-formula"
data-od-id="group-fire-investments"
data-od-id="group-restricted"
data-od-id="group-reference"
data-od-id="group-loans"
data-od-id="group-excluded"  // only when present
data-od-id="row-asset-1" / "row-asset-2" / …  // per row instance
data-od-id="cta-add-asset"
data-od-id="cta-add-liability"
data-od-id="bottom-nav"
```

- [ ] **Step 5: Add `AssetsScreenPreview` to `screen-mockups.tsx`**

Append a new exported component shaped like the existing previews (e.g. `DashboardScreenPreview`). Use mock data — no Supabase. Wrap in the same `PhoneMockup` shell as the existing previews.

- [ ] **Step 6: Wire into `/showcase`**

In `app/showcase/page.tsx`, add to the horizontal scroll list:

```tsx
<PhoneMockup label="자산 진단" subtitle="FIRE 계산 순자산 구성" data-od-id="phone-mockup-assets">
  <AssetsScreenPreview />
</PhoneMockup>
```

Add the import at the top of the file. Add the export in `components/fire-banking/index.ts`.

- [ ] **Step 7: Write Playwright spec**

Create `tests/e2e/assets-visual.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("assets preview mounts in showcase", async ({ page }) => {
  await page.goto("/showcase");
  const preview = page.locator('[data-od-id="phone-mockup-assets"]');
  await expect(preview).toBeVisible();
  await preview.screenshot({ path: "test-results/assets-preview.png" });
});

test("protected /assets redirects unauthenticated user home", async ({ page }) => {
  await page.goto("/assets");
  await expect(page).toHaveURL("/");
});
```

- [ ] **Step 8: Run typecheck, tests, Playwright**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && npm run typecheck && npm test && npm run build && npm run test:e2e --grep "assets"
```

- [ ] **Step 9: Commit**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && git add app/assets components/fire-banking app/showcase/page.tsx tests/e2e/assets-visual.spec.ts
git commit -m "refactor(assets): align with Claude-Design prototype 06b-assets

Apply prototype's net-worth formula header, four asset groups, dense
row treatment, OD markers; add AssetsScreenPreview to /showcase."
```

---

## Task 5: Subscribe (FIRE Living-Expense Adjuster) Visual Pass

**Files:**
- Read: `~/Downloads/Fire-Banking-·-Claude-Design-원본/screens/06-simulator.jsx` (409 LOC)
- Modify: `app/subscribe/page.tsx`
- Modify (as needed): `components/fire-banking/fixed-cost-simulator.tsx`
- Modify: `components/fire-banking/screen-mockups.tsx` (refresh `SimulatorScreenPreview`)
- Test: `tests/e2e/subscribe-visual.spec.ts` (new)

- [ ] **Step 1: Read prototype**

```bash
cat "/Users/macmini-cho/Downloads/Fire-Banking-·-Claude-Design-원본/screens/06-simulator.jsx"
```

- [ ] **Step 2: Read current implementation**

```bash
cat /Users/macmini-cho/Documents/Project/FireBanking/app/subscribe/page.tsx
cat /Users/macmini-cho/Documents/Project/FireBanking/components/fire-banking/fixed-cost-simulator.tsx
```

- [ ] **Step 3: Apply visual pass**

Summary modules: fixed expense, variable expense, buffer, recommended target monthly living expense, difference from current dashboard baseline. Detail modules: fixed-cost categories, variable-cost groups, buffer input, save draft, apply recommendation. Two distinct CTAs: "초안 저장" (does NOT change dashboard baseline) and "대시보드에 적용" (does — handoff state rule).

- [ ] **Step 4: Apply OD markers**

```tsx
data-screen-label="subscribe"
data-od-id="hero-recommended-expense"
data-od-id="summary-fixed"
data-od-id="summary-variable"
data-od-id="summary-buffer"
data-od-id="summary-difference"
data-od-id="group-fixed-categories"
data-od-id="group-variable-groups"
data-od-id="input-buffer"
data-od-id="cta-save-draft"
data-od-id="cta-apply-baseline"  // primary
data-od-id="bottom-nav"
```

- [ ] **Step 5: Refresh `SimulatorScreenPreview`**

Update mock data to mirror the new layout in `components/fire-banking/screen-mockups.tsx`. Wrap with `data-od-id="phone-mockup-simulator"` in `app/showcase/page.tsx`.

- [ ] **Step 6: Write Playwright spec**

Create `tests/e2e/subscribe-visual.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("subscribe preview mounts in showcase", async ({ page }) => {
  await page.goto("/showcase");
  const preview = page.locator('[data-od-id="phone-mockup-simulator"]');
  await expect(preview).toBeVisible();
  await preview.screenshot({ path: "test-results/subscribe-preview.png" });
});

test("protected /subscribe redirects unauthenticated user home", async ({ page }) => {
  await page.goto("/subscribe");
  await expect(page).toHaveURL("/");
});
```

- [ ] **Step 7: Run typecheck, tests, Playwright**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && npm run typecheck && npm test && npm run build && npm run test:e2e --grep "subscribe"
```

- [ ] **Step 8: Commit**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && git add app/subscribe components/fire-banking app/showcase/page.tsx tests/e2e/subscribe-visual.spec.ts
git commit -m "refactor(subscribe): align with Claude-Design prototype 06-simulator

Two distinct CTAs (save-draft vs apply-baseline), summary/detail modules,
OD markers; refresh SimulatorScreenPreview."
```

---

## Task 6: Onboarding (Admin) Visual Pass

**Files:**
- Read: `~/Downloads/Fire-Banking-·-Claude-Design-원본/screens/02-admin-onboarding.jsx` and `onboarding-stepper.jsx`
- Modify: `app/onboarding/page.tsx`
- Modify (as needed): `components/fire-banking/onboarding-stepper.tsx`, `form-field.tsx`
- Modify: `components/fire-banking/screen-mockups.tsx` (refresh `OnboardingScreenPreview`)
- Test: `tests/e2e/onboarding-visual.spec.ts` (new)

- [ ] **Step 1: Read prototype**

```bash
cat "/Users/macmini-cho/Downloads/Fire-Banking-·-Claude-Design-원본/screens/02-admin-onboarding.jsx"
cat "/Users/macmini-cho/Downloads/Fire-Banking-·-Claude-Design-원본/onboarding-stepper.jsx"
```

- [ ] **Step 2: Read current implementation**

```bash
cat /Users/macmini-cho/Documents/Project/FireBanking/app/onboarding/page.tsx
cat /Users/macmini-cho/Documents/Project/FireBanking/components/fire-banking/onboarding-stepper.tsx
```

- [ ] **Step 3: Apply visual pass**

Four primary numeric inputs in `만원`: target monthly living expense, after-tax monthly income, total monthly expense, investable net worth. Korean number formatting with clear large-number confirmation. Submit saves the first snapshot. Stepper renders `bg-fb-trust text-white rounded-full size-6 font-bold` for active/done; `bg-fb-line text-fb-ink-3` for pending.

- [ ] **Step 4: Apply OD markers**

```tsx
data-screen-label="onboarding"
data-od-id="stepper"
data-od-id="step-active"
data-od-id="input-monthly-living-expense"
data-od-id="input-monthly-income"
data-od-id="input-monthly-expense"
data-od-id="input-net-worth"
data-od-id="cta-primary"
```

- [ ] **Step 5: Refresh `OnboardingScreenPreview`**

Update mock layout in `components/fire-banking/screen-mockups.tsx`; wrap consumer in `app/showcase/page.tsx` with `data-od-id="phone-mockup-onboarding"`.

- [ ] **Step 6: Write Playwright spec**

Create `tests/e2e/onboarding-visual.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("onboarding preview mounts in showcase", async ({ page }) => {
  await page.goto("/showcase");
  const preview = page.locator('[data-od-id="phone-mockup-onboarding"]');
  await expect(preview).toBeVisible();
  await preview.screenshot({ path: "test-results/onboarding-preview.png" });
});

test("protected /onboarding redirects unauthenticated user home", async ({ page }) => {
  await page.goto("/onboarding");
  await expect(page).toHaveURL("/");
});
```

- [ ] **Step 7: Run typecheck, tests, Playwright**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && npm run typecheck && npm test && npm run build && npm run test:e2e --grep "onboarding"
```

The existing `onboarding-stepper.test.tsx` must still pass.

- [ ] **Step 8: Commit**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && git add app/onboarding components/fire-banking app/showcase/page.tsx tests/e2e/onboarding-visual.spec.ts
git commit -m "refactor(onboarding): align with Claude-Design prototype 02-admin-onboarding"
```

---

## Task 7: New Screen — `/onboarding/result` (First FIRE Result Bridge)

**Files:**
- Read: `~/Downloads/Fire-Banking-·-Claude-Design-원본/screens/03b-result-bridge.jsx`
- Create: `app/onboarding/result/page.tsx`
- Create: `components/fire-banking/onboarding-result-bridge.tsx`
- Create: `components/fire-banking/onboarding-result-bridge.test.tsx`
- Modify: `components/fire-banking/screen-mockups.tsx` (add `ResultBridgeScreenPreview`)
- Modify: `components/fire-banking/index.ts`
- Modify: `app/showcase/page.tsx`
- Modify: `app/onboarding/page.tsx` (post-submit redirect to `/onboarding/result`)
- Test: `tests/e2e/onboarding-result-visual.spec.ts` (new)

- [ ] **Step 1: Read prototype**

```bash
cat "/Users/macmini-cho/Downloads/Fire-Banking-·-Claude-Design-원본/screens/03b-result-bridge.jsx"
```

Note: the screen is a one-time comprehension surface, NOT a full dashboard.

- [ ] **Step 2: Write the failing test for `OnboardingResultBridge`**

Create `components/fire-banking/onboarding-result-bridge.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { OnboardingResultBridge } from "./onboarding-result-bridge";

describe("OnboardingResultBridge", () => {
  it("renders the first FIRE result summary, remaining amount, and dual CTA", () => {
    render(
      <OnboardingResultBridge
        targetAssetMan={140000}
        currentNetWorthMan={20000}
        remainingMan={120000}
        targetMonthlyExpenseMan={250}
        onInviteSpouse={vi.fn()}
        onContinueToDashboard={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: /첫 FIRE 결과/ })).toBeVisible();
    expect(screen.getByText(/남은 금액/)).toBeVisible();
    expect(screen.getByRole("button", { name: /배우자에게/ })).toBeVisible();
    expect(screen.getByRole("button", { name: /먼저 대시보드/ })).toBeVisible();
  });

  it("calls onInviteSpouse when the primary CTA is clicked", async () => {
    const onInvite = vi.fn();
    const { getByRole } = render(
      <OnboardingResultBridge
        targetAssetMan={140000}
        currentNetWorthMan={20000}
        remainingMan={120000}
        targetMonthlyExpenseMan={250}
        onInviteSpouse={onInvite}
        onContinueToDashboard={vi.fn()}
      />,
    );
    getByRole("button", { name: /배우자에게/ }).click();
    expect(onInvite).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 3: Run the test to confirm it fails**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && npm test -- components/fire-banking/onboarding-result-bridge.test.tsx
```

Expected: fail with module-not-found.

- [ ] **Step 4: Implement `OnboardingResultBridge`**

Create `components/fire-banking/onboarding-result-bridge.tsx`:

```tsx
"use client";

import { Button } from "./button";
import { Card } from "./card";
import { FireHeroCard } from "./fire-hero-card";

export interface OnboardingResultBridgeProps {
  targetAssetMan: number;
  currentNetWorthMan: number;
  remainingMan: number;
  targetMonthlyExpenseMan: number;
  onInviteSpouse: () => void;
  onContinueToDashboard: () => void;
}

export function OnboardingResultBridge({
  targetAssetMan,
  currentNetWorthMan,
  remainingMan,
  targetMonthlyExpenseMan,
  onInviteSpouse,
  onContinueToDashboard,
}: OnboardingResultBridgeProps) {
  return (
    <div
      data-screen-label="onboarding-result"
      className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col gap-5 px-4 pb-10 pt-6"
    >
      <header className="flex flex-col gap-2" data-od-id="result-header">
        <p className="text-xs font-bold uppercase tracking-wide text-fb-trust">첫 FIRE 결과</p>
        <h1 className="text-2xl font-extrabold leading-tight text-fb-ink">
          우리 가정의 경제적 자유
          <br />
          현재 위치
        </h1>
        <p className="text-sm leading-6 text-fb-ink-2">
          입력하신 4가지 숫자로 계산한 첫 결과예요. 배우자가 3가지 숫자를 더해주면 더 정확해져요.
        </p>
      </header>

      <FireHeroCard
        data-od-id="hero-fire"
        targetAssetMan={targetAssetMan}
        currentNetWorthMan={currentNetWorthMan}
        targetMonthlyExpenseMan={targetMonthlyExpenseMan}
      />

      <Card className="p-5" data-od-id="remaining-summary">
        <p className="text-xs font-bold text-fb-ink-2">FIRE까지 남은 금액</p>
        <p className="mt-2 text-3xl font-black text-fb-ink fb-num">{remainingMan.toLocaleString("ko-KR")}만원</p>
        <p className="mt-3 text-sm leading-6 text-fb-ink-2">
          연간 생활비의 25배를 목표로 계산했어요. (5% 연 복리 가정)
        </p>
      </Card>

      <Card className="bg-fb-trust-soft p-5" data-od-id="spouse-recommendation">
        <p className="text-sm font-bold text-fb-trust-ink">배우자가 함께 입력하면 더 정확해져요</p>
        <p className="mt-2 text-sm leading-6 text-fb-trust-ink/80">
          세후 월소득, 월 고정지출, 월 저축·투자 — 3가지만 받으면 돼요.
        </p>
      </Card>

      <div className="mt-auto flex flex-col gap-2">
        <Button
          className="w-full"
          onClick={onInviteSpouse}
          data-od-id="cta-primary"
        >
          배우자에게 3가지 묻기
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          onClick={onContinueToDashboard}
          data-od-id="cta-secondary"
        >
          먼저 대시보드 보기
        </Button>
      </div>
    </div>
  );
}
```

If `FireHeroCard`'s prop names differ (e.g. it doesn't accept `data-od-id` on a typed prop), pass markers via a wrapper `<div data-od-id="hero-fire">` and remove the prop on the component. The test's text matchers stay valid.

- [ ] **Step 5: Run the test to confirm it passes**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && npm test -- components/fire-banking/onboarding-result-bridge.test.tsx
```

Expected: both test cases pass.

- [ ] **Step 6: Add export to `components/fire-banking/index.ts`**

Append:

```ts
export { OnboardingResultBridge } from "./onboarding-result-bridge";
```

- [ ] **Step 7: Create the route page**

Create `app/onboarding/result/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { OnboardingResultBridge } from "@/components/fire-banking";
import { createSupabaseServerClient } from "@/lib/supabase-server"; // adjust import to match repo

export default async function OnboardingResultPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // Load the latest snapshot for this user; redirect to /onboarding if none.
  // Replace with actual project query helper.
  const snapshot = await loadLatestSnapshotForUser(supabase, user.id);
  if (!snapshot) redirect("/onboarding");

  return (
    <OnboardingResultBridgeServerWrapper
      targetAssetMan={snapshot.targetAssetMan}
      currentNetWorthMan={snapshot.currentNetWorthMan}
      remainingMan={snapshot.remainingMan}
      targetMonthlyExpenseMan={snapshot.targetMonthlyExpenseMan}
    />
  );
}

// Replace with the actual snapshot loader used elsewhere (likely in `lib/`).
async function loadLatestSnapshotForUser(_supabase: unknown, _userId: string) {
  return null as null | {
    targetAssetMan: number;
    currentNetWorthMan: number;
    remainingMan: number;
    targetMonthlyExpenseMan: number;
  };
}
```

Then:
1. Replace `loadLatestSnapshotForUser` with the actual helper used by `/dashboard` (search for the function the dashboard uses to fetch the latest snapshot — likely in `lib/`).
2. Wrap the bridge in a small client component `OnboardingResultBridgeServerWrapper` that holds the `useRouter` for the two CTA callbacks (`router.push("/together")` for invite, `router.push("/dashboard")` for continue), since the bridge itself is a client component but the route page is a server component.

If a `lib/supabase-server.ts` helper does not exist by that name, use whatever helper `app/dashboard/page.tsx` already uses for server-side Supabase access.

- [ ] **Step 8: Wire post-onboarding redirect**

In `app/onboarding/page.tsx`, where the form's submit handler currently redirects on success, change the destination to `/onboarding/result`. Search the file for `router.push("/dashboard")` (or the equivalent) inside the submit handler and update it. If onboarding is server-action driven, change the `redirect("/dashboard")` call site instead.

- [ ] **Step 9: Add `ResultBridgeScreenPreview` to `screen-mockups.tsx`**

Append:

```tsx
export function ResultBridgeScreenPreview() {
  return (
    <OnboardingResultBridge
      targetAssetMan={140000}
      currentNetWorthMan={20000}
      remainingMan={120000}
      targetMonthlyExpenseMan={250}
      onInviteSpouse={() => undefined}
      onContinueToDashboard={() => undefined}
    />
  );
}
```

Add the export to `components/fire-banking/index.ts`. Wire into `app/showcase/page.tsx`:

```tsx
<PhoneMockup label="첫 FIRE 결과" subtitle="배우자 초대 안내" data-od-id="phone-mockup-result-bridge">
  <ResultBridgeScreenPreview />
</PhoneMockup>
```

- [ ] **Step 10: Write Playwright spec**

Create `tests/e2e/onboarding-result-visual.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("result bridge preview mounts in showcase", async ({ page }) => {
  await page.goto("/showcase");
  const preview = page.locator('[data-od-id="phone-mockup-result-bridge"]');
  await expect(preview).toBeVisible();
  await preview.screenshot({ path: "test-results/onboarding-result-preview.png" });
});

test("protected /onboarding/result redirects unauthenticated user home", async ({ page }) => {
  await page.goto("/onboarding/result");
  await expect(page).toHaveURL("/");
});
```

- [ ] **Step 11: Run all checks**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && npm run typecheck && npm test && npm run build && npm run test:e2e --grep "onboarding result|result bridge"
```

- [ ] **Step 12: Commit**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && git add app/onboarding components/fire-banking app/showcase/page.tsx tests/e2e/onboarding-result-visual.spec.ts
git commit -m "feat(onboarding-result): add /onboarding/result first-FIRE-result bridge

Adapts Claude-Design prototype 03b-result-bridge as a one-time bridge
between admin onboarding submit and dashboard. Single primary CTA invites
spouse; secondary CTA goes straight to dashboard. Bridge is intentionally
narrow — does not grow into a dashboard."
```

---

## Task 8: Invite Acceptance Visual Pass

**Files:**
- Read: `~/Downloads/Fire-Banking-·-Claude-Design-원본/screens/04-invite-accept.jsx`
- Modify: `app/invite/[token]/page.tsx`
- Modify (as needed): `components/fire-banking/invite-card.tsx`
- Modify: `components/fire-banking/screen-mockups.tsx` (refresh `InviteScreenPreview`)
- Test: `tests/e2e/invite-visual.spec.ts` (new)

- [ ] **Step 1: Read prototype**

```bash
cat "/Users/macmini-cho/Downloads/Fire-Banking-·-Claude-Design-원본/screens/04-invite-accept.jsx"
```

- [ ] **Step 2: Read current implementation**

```bash
cat /Users/macmini-cho/Documents/Project/FireBanking/app/invite/\[token\]/page.tsx
cat /Users/macmini-cho/Documents/Project/FireBanking/components/fire-banking/invite-card.tsx
```

- [ ] **Step 3: Apply visual pass**

Single primary CTA "수락하기" (or prototype's exact label) → routes to `/invite/[token]/lite` (Task 9). Single secondary "다음에 할게요" or equivalent → routes home. Hero card explains the spouse-Lite scope.

- [ ] **Step 4: Apply OD markers**

```tsx
data-screen-label="invite-accept"
data-od-id="invite-card"
data-od-id="cta-primary"     // accept
data-od-id="cta-secondary"   // skip
```

- [ ] **Step 5: Refresh `InviteScreenPreview`**

Update mock and wrap consumer with `data-od-id="phone-mockup-invite"`.

- [ ] **Step 6: Write Playwright spec**

Create `tests/e2e/invite-visual.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("invite preview mounts in showcase", async ({ page }) => {
  await page.goto("/showcase");
  const preview = page.locator('[data-od-id="phone-mockup-invite"]');
  await expect(preview).toBeVisible();
  await preview.screenshot({ path: "test-results/invite-preview.png" });
});

test("/invite/[token] renders without auth (R0 explainer)", async ({ page }) => {
  await page.goto("/invite/test-token");
  await expect(page.locator('[data-screen-label="invite-accept"]')).toBeVisible();
});
```

- [ ] **Step 7: Run all checks**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && npm run typecheck && npm test && npm run build && npm run test:e2e --grep "invite"
```

- [ ] **Step 8: Commit**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && git add app/invite components/fire-banking app/showcase/page.tsx tests/e2e/invite-visual.spec.ts
git commit -m "refactor(invite): align with Claude-Design prototype 04-invite-accept"
```

---

## Task 9: New Screen — `/invite/[token]/lite` (Lite Spouse Onboarding)

**Files:**
- Read: `~/Downloads/Fire-Banking-·-Claude-Design-원본/screens/05-lite-onboarding.jsx`
- Create: `app/invite/[token]/lite/page.tsx`
- Modify: `components/fire-banking/lite-onboarding.tsx` (extend or rewrite to mirror prototype's 3-step flow)
- Existing test: `components/fire-banking/lite-onboarding.test.tsx` (update assertions to match new structure)
- Modify: `app/invite/[token]/page.tsx` (accept CTA routes to `/invite/[token]/lite`)
- Modify: `components/fire-banking/screen-mockups.tsx` (refresh `LiteScreenPreview`)
- Test: `tests/e2e/lite-onboarding-visual.spec.ts` (new)

- [ ] **Step 1: Read prototype**

```bash
cat "/Users/macmini-cho/Downloads/Fire-Banking-·-Claude-Design-원본/screens/05-lite-onboarding.jsx"
```

- [ ] **Step 2: Read current implementation**

```bash
cat /Users/macmini-cho/Documents/Project/FireBanking/components/fire-banking/lite-onboarding.tsx
cat /Users/macmini-cho/Documents/Project/FireBanking/components/fire-banking/lite-onboarding.test.tsx
```

- [ ] **Step 3: Update the existing failing test**

In `lite-onboarding.test.tsx`, update assertions to match the prototype's 3-step shape:
- Step 1: 세후 월소득
- Step 2: 월 고정지출
- Step 3: 월 저축·투자

Each step shows one primary numeric input plus an optional "지난달과 같아요" reuse action when previous-month data exists. Completion triggers a `onComplete({ income, expense, savings })` callback.

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LiteOnboarding } from "./lite-onboarding";

describe("LiteOnboarding", () => {
  it("walks through three steps and reports completion", () => {
    const onComplete = vi.fn();
    render(<LiteOnboarding onComplete={onComplete} />);

    // step 1
    expect(screen.getByText(/세후 월소득/)).toBeVisible();
    fireEvent.change(screen.getByLabelText(/세후 월소득/), { target: { value: "320" } });
    fireEvent.click(screen.getByRole("button", { name: /다음/ }));

    // step 2
    expect(screen.getByText(/월 고정지출/)).toBeVisible();
    fireEvent.change(screen.getByLabelText(/월 고정지출/), { target: { value: "180" } });
    fireEvent.click(screen.getByRole("button", { name: /다음/ }));

    // step 3
    expect(screen.getByText(/월 저축·투자/)).toBeVisible();
    fireEvent.change(screen.getByLabelText(/월 저축·투자/), { target: { value: "120" } });
    fireEvent.click(screen.getByRole("button", { name: /완료/ }));

    expect(onComplete).toHaveBeenCalledWith({ incomeMan: 320, expenseMan: 180, savingsMan: 120 });
  });

  it("offers a reuse action when previous values exist", () => {
    render(<LiteOnboarding onComplete={vi.fn()} previous={{ incomeMan: 300, expenseMan: 170, savingsMan: 110 }} />);
    expect(screen.getByRole("button", { name: /지난달과 같아요/ })).toBeVisible();
  });
});
```

- [ ] **Step 4: Run the test to confirm it fails (or partially fails)**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && npm test -- components/fire-banking/lite-onboarding.test.tsx
```

- [ ] **Step 5: Implement / extend `LiteOnboarding`**

Open `components/fire-banking/lite-onboarding.tsx`. If it already implements a similar flow, adapt the steps and prop shape to match the test (one numeric input per step, three steps, `onComplete({ incomeMan, expenseMan, savingsMan })`, `previous?` prop powering the reuse action). If the existing component diverges significantly, replace its body but keep the file path so consumers don't need to update imports.

Use `MoneyInputRow` and `Button` primitives from `components/fire-banking/`. Apply OD markers:

```tsx
// container
data-screen-label="lite-onboarding"
// children
data-od-id="stepper"
data-od-id="step-active"
data-od-id="input-income" / "input-expense" / "input-savings"  // active step's input
data-od-id="cta-primary"     // 다음 / 완료
data-od-id="cta-reuse-prev"  // visible only when previous exists
```

- [ ] **Step 6: Run the test to confirm it passes**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && npm test -- components/fire-banking/lite-onboarding.test.tsx
```

- [ ] **Step 7: Create the route**

Create `app/invite/[token]/lite/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { LiteOnboarding } from "@/components/fire-banking";
import { LiteOnboardingClient } from "./lite-onboarding-client";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function LiteOnboardingPage({ params }: PageProps) {
  const { token } = await params;
  // Validate token + load any previous spouse-side snapshot using the
  // same helper /invite/[token] uses; redirect home on bad token.
  const ctx = await loadInviteContext(token);
  if (!ctx) redirect("/");

  return <LiteOnboardingClient token={token} previous={ctx.previous} />;
}

async function loadInviteContext(_token: string) {
  return null as null | { previous?: { incomeMan: number; expenseMan: number; savingsMan: number } };
}
```

Plus the client wrapper `app/invite/[token]/lite/lite-onboarding-client.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LiteOnboarding } from "@/components/fire-banking";

export function LiteOnboardingClient({
  token,
  previous,
}: {
  token: string;
  previous?: { incomeMan: number; expenseMan: number; savingsMan: number };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <LiteOnboarding
      previous={previous}
      onComplete={(values) => {
        startTransition(async () => {
          await fetch(`/api/invite/${token}/lite`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          router.push("/dashboard");
        });
      }}
    />
  );
}
```

Replace `loadInviteContext` and the POST endpoint with whatever the project already uses for spouse-side persistence. If the project uses a server action instead of an API route, swap the `fetch` for the action call.

- [ ] **Step 8: Wire the invite-accept CTA to `/invite/[token]/lite`**

In `app/invite/[token]/page.tsx` (modified in Task 8), confirm the primary CTA navigates to `/invite/${token}/lite`.

- [ ] **Step 9: Refresh `LiteScreenPreview`**

In `components/fire-banking/screen-mockups.tsx`, render `<LiteOnboarding onComplete={() => undefined} />` so the preview matches the new component shape. Wrap consumer in `app/showcase/page.tsx` with `data-od-id="phone-mockup-lite"`.

- [ ] **Step 10: Write Playwright spec**

Create `tests/e2e/lite-onboarding-visual.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("lite onboarding preview mounts in showcase", async ({ page }) => {
  await page.goto("/showcase");
  const preview = page.locator('[data-od-id="phone-mockup-lite"]');
  await expect(preview).toBeVisible();
  await preview.screenshot({ path: "test-results/lite-onboarding-preview.png" });
});

test("/invite/[token]/lite redirects on invalid token", async ({ page }) => {
  await page.goto("/invite/this-is-not-a-real-token/lite");
  await expect(page).toHaveURL("/");
});
```

- [ ] **Step 11: Run all checks**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && npm run typecheck && npm test && npm run build && npm run test:e2e --grep "lite"
```

- [ ] **Step 12: Commit**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && git add app/invite components/fire-banking app/showcase/page.tsx tests/e2e/lite-onboarding-visual.spec.ts
git commit -m "feat(invite-lite): add /invite/[token]/lite three-step spouse onboarding

Adapts Claude-Design prototype 05-lite-onboarding into a route that
follows /invite/[token] acceptance. One primary numeric decision per
step (income/expense/savings), reuse-previous quick action when prior
data exists."
```

---

## Task 10: History Visual Pass

**Files:**
- Read: `~/Downloads/Fire-Banking-·-Claude-Design-원본/screens/07-history-tab.jsx`
- Modify: `app/history/page.tsx`
- Modify (as needed): `components/fire-banking/*.tsx`
- Modify: `components/fire-banking/screen-mockups.tsx` (add `HistoryScreenPreview`)
- Modify: `app/showcase/page.tsx`, `components/fire-banking/index.ts`
- Test: `tests/e2e/history-visual.spec.ts` (new)

- [ ] **Step 1: Read prototype**

```bash
cat "/Users/macmini-cho/Downloads/Fire-Banking-·-Claude-Design-원본/screens/07-history-tab.jsx"
```

- [ ] **Step 2: Read current implementation**

```bash
cat /Users/macmini-cho/Documents/Project/FireBanking/app/history/page.tsx
```

- [ ] **Step 3: Apply visual pass**

Two states: empty and list. Each row shows month label, FIRE-reflected net worth, delta vs previous month (`fb-positive`/`fb-negative` only), and a status pill `정상`/`임시`/`확정`. Rows: dense table style — right-aligned numbers, `text-fb-ink` for values, `text-fb-ink-2` for labels, `border-fb-line-soft` separators, no zebra rows. **Hard rule (handoff): do not show hard-coded sample history as if real user data.** The empty state must be explicit.

- [ ] **Step 4: Apply OD markers**

```tsx
data-screen-label="history"
data-od-id="empty-state"     // or
data-od-id="history-list"
data-od-id="row-month-1" / "row-month-2" / …
data-od-id="status-pill-finalized"  // per row, mirror status
data-od-id="bottom-nav"
```

- [ ] **Step 5: Add `HistoryScreenPreview` to `screen-mockups.tsx`**

Render two variants if convenient (empty + list), or pick the list variant for the showcase. Add export, wire into `/showcase` with `data-od-id="phone-mockup-history"`.

- [ ] **Step 6: Write Playwright spec**

Create `tests/e2e/history-visual.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("history preview mounts in showcase", async ({ page }) => {
  await page.goto("/showcase");
  const preview = page.locator('[data-od-id="phone-mockup-history"]');
  await expect(preview).toBeVisible();
  await preview.screenshot({ path: "test-results/history-preview.png" });
});

test("protected /history redirects unauthenticated user home", async ({ page }) => {
  await page.goto("/history");
  await expect(page).toHaveURL("/");
});
```

- [ ] **Step 7: Run all checks**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && npm run typecheck && npm test && npm run build && npm run test:e2e --grep "history"
```

- [ ] **Step 8: Commit**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && git add app/history components/fire-banking app/showcase/page.tsx tests/e2e/history-visual.spec.ts
git commit -m "refactor(history): align with Claude-Design prototype 07-history-tab

Empty state explicit; list rows in dense, no-zebra style; status pills
keyed to finalized/temporary; OD markers; HistoryScreenPreview added."
```

---

## Task 11: Together Visual Pass

**Files:**
- Read: `~/Downloads/Fire-Banking-·-Claude-Design-원본/screens/09-together-tab.jsx`
- Modify: `app/together/page.tsx`
- Modify (as needed): `components/fire-banking/invite-card.tsx`, `partner-*` cards
- Modify: `components/fire-banking/screen-mockups.tsx` (add `TogetherScreenPreview`)
- Modify: `app/showcase/page.tsx`, `components/fire-banking/index.ts`
- Test: `tests/e2e/together-visual.spec.ts` (new)

- [ ] **Step 1: Read prototype**

```bash
cat "/Users/macmini-cho/Downloads/Fire-Banking-·-Claude-Design-원본/screens/09-together-tab.jsx"
```

- [ ] **Step 2: Read current implementation**

```bash
cat /Users/macmini-cho/Documents/Project/FireBanking/app/together/page.tsx
```

- [ ] **Step 3: Apply visual pass**

Modules: partner connection status, invite link creation/re-share, current month check-in status, Lite input completion state, next check-in context. Use the spouse-card state rules from handoff:
- no invite yet: invite recommendation/action
- invite sent, not accepted: waiting + copy/share
- accepted, no Lite input: input-waiting state
- Lite complete: completion status

- [ ] **Step 4: Apply OD markers**

```tsx
data-screen-label="together"
data-od-id="partner-status"
data-od-id="invite-link-card"
data-od-id="checkin-status"
data-od-id="cta-share-invite"
data-od-id="cta-primary"   // whichever single primary fits the current state
data-od-id="bottom-nav"
```

- [ ] **Step 5: Add `TogetherScreenPreview` to `screen-mockups.tsx`**

Render the most representative state (likely "invite sent, waiting"). Add export, wire into `/showcase` with `data-od-id="phone-mockup-together"`.

- [ ] **Step 6: Write Playwright spec**

Create `tests/e2e/together-visual.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("together preview mounts in showcase", async ({ page }) => {
  await page.goto("/showcase");
  const preview = page.locator('[data-od-id="phone-mockup-together"]');
  await expect(preview).toBeVisible();
  await preview.screenshot({ path: "test-results/together-preview.png" });
});

test("protected /together redirects unauthenticated user home", async ({ page }) => {
  await page.goto("/together");
  await expect(page).toHaveURL("/");
});
```

- [ ] **Step 7: Run all checks**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && npm run typecheck && npm test && npm run build && npm run test:e2e --grep "together"
```

- [ ] **Step 8: Commit**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && git add app/together components/fire-banking app/showcase/page.tsx tests/e2e/together-visual.spec.ts
git commit -m "refactor(together): align with Claude-Design prototype 09-together-tab"
```

---

## Task 12: Settings + Auth Visual Pass

**Files:**
- Read: `~/Downloads/Fire-Banking-·-Claude-Design-원본/screens/10-settings-tab.jsx` and `screens/01-login.jsx`
- Modify: `app/settings/page.tsx`
- Modify: `app/auth/callback/route.ts` (visual not applicable; check copy only) and the `/` entry route page
- Modify (as needed): `components/fire-banking/landing-experience.tsx`, `brand.tsx`, settings-specific rows
- Modify: `components/fire-banking/screen-mockups.tsx` (add `SettingsScreenPreview`, refresh `LoginScreenPreview`)
- Modify: `app/showcase/page.tsx`, `components/fire-banking/index.ts`
- Test: `tests/e2e/settings-visual.spec.ts` (new)

- [ ] **Step 1: Read prototypes**

```bash
cat "/Users/macmini-cho/Downloads/Fire-Banking-·-Claude-Design-원본/screens/10-settings-tab.jsx"
cat "/Users/macmini-cho/Downloads/Fire-Banking-·-Claude-Design-원본/screens/01-login.jsx"
```

- [ ] **Step 2: Read current implementations**

```bash
cat /Users/macmini-cho/Documents/Project/FireBanking/app/settings/page.tsx
cat /Users/macmini-cho/Documents/Project/FireBanking/app/page.tsx 2>/dev/null
ls /Users/macmini-cho/Documents/Project/FireBanking/app/auth
cat /Users/macmini-cho/Documents/Project/FireBanking/components/fire-banking/landing-experience.tsx | head -80
```

- [ ] **Step 3: Apply visual pass — Settings**

Modules: profile/account, data and couple-sharing scope, FIRE calculation assumptions, non-advice disclaimer, sign out. **Hard rule (handoff): do not show fake settings rows or clickable-looking actions that do nothing.** Every row that renders must have a working handler or be visibly inert (no chevron, `cursor-default`, `text-fb-ink-3`).

- [ ] **Step 4: Apply visual pass — Auth / Login**

Identity + concise product definition + sign-in action + auth error state when callback fails. The Kakao OAuth button (if rendered) is brand-locked: `bg-fb-kakao text-fb-kakao-ink rounded-button h-14 font-bold`, KakaoTalk speech-bubble icon left, label "카카오로 시작하기". Do not restyle. Google button keeps current treatment.

- [ ] **Step 5: Apply OD markers**

Settings:

```tsx
data-screen-label="settings"
data-od-id="row-profile"
data-od-id="row-data-sharing"
data-od-id="row-fire-assumptions"
data-od-id="row-disclaimer"
data-od-id="cta-sign-out"
data-od-id="bottom-nav"
```

Auth/landing:

```tsx
data-screen-label="login"
data-od-id="brand-lockup"
data-od-id="product-definition"
data-od-id="cta-google-signin"
data-od-id="kakao-login"  // if rendered
data-od-id="auth-error"   // when error state
```

- [ ] **Step 6: Add `SettingsScreenPreview` and refresh `LoginScreenPreview`**

Add `SettingsScreenPreview` to `screen-mockups.tsx`; refresh `LoginScreenPreview` against the prototype. Add export, wire both into `/showcase` with `data-od-id="phone-mockup-settings"` and ensure the existing login mock has `data-od-id="phone-mockup-login"`.

- [ ] **Step 7: Write Playwright spec**

Create `tests/e2e/settings-visual.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("settings preview mounts in showcase", async ({ page }) => {
  await page.goto("/showcase");
  const preview = page.locator('[data-od-id="phone-mockup-settings"]');
  await expect(preview).toBeVisible();
  await preview.screenshot({ path: "test-results/settings-preview.png" });
});

test("login preview mounts in showcase", async ({ page }) => {
  await page.goto("/showcase");
  const preview = page.locator('[data-od-id="phone-mockup-login"]');
  await expect(preview).toBeVisible();
  await preview.screenshot({ path: "test-results/login-preview.png" });
});

test("entry route renders R0 positioning", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /부부가 함께 순자산과 경제적 자유 진척/ }),
  ).toBeVisible();
});
```

- [ ] **Step 8: Run all checks**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && npm run typecheck && npm test && npm run build && npm run test:e2e --grep "settings|login|R0"
```

The existing `r0-admin-solo.spec.ts` must still pass.

- [ ] **Step 9: Commit**

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && git add app/settings app/page.tsx app/auth components/fire-banking app/showcase/page.tsx tests/e2e/settings-visual.spec.ts
git commit -m "refactor(settings,auth): align with Claude-Design prototypes 10-settings + 01-login

Settings rows visibly inert when not actionable (no fake chevrons).
Auth landing matches prototype hierarchy; Kakao button stays brand-locked."
```

---

## Self-Review

After completing every task:

```bash
cd /Users/macmini-cho/Documents/Project/FireBanking && npm run typecheck && npm test && npm run build && npm run test:e2e
```

Then verify the four invariants:

1. **No A-palette regression:**
   ```bash
   grep -rEn "fb-(muted|subtle|sand|stone|sage|slate|bluegray|surface|bg|green|warning|danger)[a-z0-9/-]*" /Users/macmini-cho/Documents/Project/FireBanking/app /Users/macmini-cho/Documents/Project/FireBanking/components
   ```
   Expected: empty.

2. **Every refactored route has a `data-screen-label`:**
   ```bash
   grep -rEn 'data-screen-label="(login|onboarding|onboarding-result|dashboard|dashboard-desktop|invite-accept|lite-onboarding|subscribe|assets|history|together|settings|design-system|showcase)"' /Users/macmini-cho/Documents/Project/FireBanking/app /Users/macmini-cho/Documents/Project/FireBanking/components
   ```
   Expected: at least one match per label above.

3. **`/insights` is gone:**
   ```bash
   ls /Users/macmini-cho/Documents/Project/FireBanking/app/insights 2>&1
   ```
   Expected: `No such file or directory`.

4. **Existing R0 spec still passes:**
   ```bash
   cd /Users/macmini-cho/Documents/Project/FireBanking && npm run test:e2e --grep "R0"
   ```

If any of the four fails, fix before declaring the refactor complete.

---

## Risks & Mitigations (recap from spec)

- **Tailwind v4 / v3 conflict.** Task 0 ships token cleanup and residual class migration in the same commit. Build must pass.
- **OD-marker drift on regeneration.** Markers derive from semantic role, not visual position. Stable IDs across regenerations.
- **Behavior change masquerading as design.** Each per-screen task explicitly preserves Supabase data flows and lists the data states the screen must still render correctly.
- **Insights redirect SEO.** `permanent: true` (308) acceptable in closed beta. Revisit before public launch.
