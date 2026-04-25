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
