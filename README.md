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
