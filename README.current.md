# SocialVault / AccountBazaar – Current State

## Stack (as implemented)
- **Frontend:** Next.js 14, TypeScript, Tailwind, shadcn/ui, Clerk auth, API client via axios.
- **Backend:** Express + Prisma on MongoDB; Clerk auth middleware; Razorpay hooks scaffolded; Redis client scaffolded.
- **Tooling:** pnpm + Turbo; ESLint with relaxed rules (unsafe/any/hook deps disabled); TypeScript 5.9.3 (outside @typescript-eslint supported range but lint passes).

## Implemented Features
- Listings: create → defaults to `pending_review` and `unverified`; browse page consumes API; detail page fixes sticky card overlap; seller profile link shown in admin list.
- Admin: list/filter listings; approve/reject pending/pending_review/unverified; badges for pending review/unverified.
- Offers: allowed only on active listings.
- Payments: Razorpay webhook handler skeleton; transaction/payment service stubs present.

## Known Gaps vs Current Code
- Payments/escrow flows incomplete (no full capture/refund business logic, no buyer/seller balance/escrow state machine).
- Type safety: request bodies/queries largely untyped; many ESLint rules disabled.
- Frontend uses `<img>` instead of `next/image`; no React Query/SWR for data fetching; minimal loading/error states.
- Auth/roles: Clerk present, but role guards should be audited across routes.
- DevOps: no CI/CD configs, Docker, or infra manifests in repo.

## Future Vision (Aspirational)
- Hardened escrow/payments with full Razorpay capture/refund, escrow state machine, and notifications.
- Stricter lint/type safety (enable `no-unsafe-*`, `no-explicit-any`, hook deps; typed request schemas with Zod).
- Better UX/perf: data fetching with caching (React Query/SWR), skeleton/loading/error states, image optimization with `next/image`.
- Monitoring/ops: CI pipeline (lint/test/build), containerization, deploy recipes, env docs, secrets management.
- Optional: search improvements, fraud/abuse detection, richer admin dashboards.

## Roadmap (next steps)
1) **Type & lint hardening:** Add Zod schemas/types for routes; re-enable strict ESLint rules; clean unused vars (prefix `_`).
2) **Payments/escrow:** Implement Razorpay success/failure/refund flows; persist payment/escrow statuses; add webhook tests and UI surfacing.
3) **Frontend polish:** Replace `<img>` with `next/image`; add SWR/React Query for lists/detail; improve loading/error/pagination UX.
4) **Auth/roles:** Audit admin route protection and UI guards; document required env vars for Clerk and API URLs.
5) **DevOps:** Add GitHub Actions for lint/test; optional Docker build; consider pinning TS or upgrading @typescript-eslint to match TS 5.9.

## Setup (current)
- Install: `pnpm install`
- Lint: `NEXT_DISABLE_ESLINT_PROMPT=1 pnpm lint` (passes with relaxed rules)
- Run backend: `cd apps/backend && pnpm dev` (ensure Mongo/Redis envs set)
- Run frontend: `cd apps/frontend && pnpm dev` (ensure Clerk/ API envs set)

> This file reflects the current repo state and a pragmatic roadmap. The original Readme.md contains an aspirational/legacy spec and should be treated as future vision until updated.
