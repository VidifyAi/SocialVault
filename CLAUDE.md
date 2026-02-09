# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Install dependencies
pnpm install

# Run all dev servers (backend + frontend)
pnpm dev

# Build everything (turbo orchestrated)
pnpm build

# Lint all packages
pnpm lint

# Run tests
pnpm test

# Database
pnpm db:migrate          # Run Prisma migrations
pnpm db:seed             # Seed with test data
pnpm --filter backend exec prisma generate   # Regenerate Prisma client after schema changes
pnpm --filter backend exec prisma studio     # Open MongoDB browser

# Individual packages
pnpm --filter backend dev        # Backend only (tsx watch, port 3001)
pnpm --filter frontend dev       # Frontend only (Next.js, port 3000)
pnpm --filter backend test       # Backend tests only (Jest)
pnpm --filter backend build      # Backend build only
```

## Architecture

**Monorepo** using pnpm workspaces + Turbo with three packages:

- **`apps/backend`** — Express API server (port 3001) with Prisma (MongoDB), Clerk auth, Razorpay payments, Socket.io real-time, S3 uploads, Resend email
- **`apps/frontend`** — Next.js 14 App Router with shadcn/ui, Clerk auth, Tailwind CSS, TanStack Query
- **`packages/types`** — Shared TypeScript types imported as `@socialswapr/types`

### Backend Structure

Entry point: `apps/backend/src/index.ts` — sets up Express with CORS, Helmet, rate limiting, Socket.io, and mounts all routes at `/api/v1/*`.

- **Routes** (`src/routes/`): users, listings, transactions, messages, offers, reviews, admin, payments, uploads, scraper
- **Services** (`src/services/`): business logic layer — one service per domain (listing, payment, transaction, offer, message, scraper, email, upload, admin)
- **Middleware** (`src/middleware/`): Clerk JWT auth (`auth.ts`), Zod validation (`validate.ts`), error handler
- **Scrapers** (`src/services/platforms/`): Instagram (Cheerio HTML scraping) + YouTube (Data API v3) with shared interfaces in `types.ts`
- **WebSocket** (`src/websocket/`): Clerk-authenticated Socket.io for messaging, notifications, online status
- **Config** (`src/config/index.ts`): centralized env var loading, platform fee config

### Frontend Structure

Entry point: `apps/frontend/src/app/layout.tsx` — ClerkProvider wrapper with Razorpay script.

- **App Router pages** in `src/app/`: browse, listing/[id], dashboard/*, admin, checkout, pricing, user/[id], static pages
- **Components**: `src/components/ui/` (shadcn), `src/components/layout/` (Navbar, Footer), domain-specific components
- **Libs**: `src/lib/api.ts` (Axios instance), `src/lib/utils.ts` (formatCurrency, formatNumber, cn, etc.)
- Frontend rewrites `/api/*` requests to the backend URL (configured in `next.config.js`)

### Data Flow

- All auth goes through Clerk; `clerkId` links Clerk users to the Prisma `User` model
- Razorpay is the sole payment processor (no Stripe)
- Currency is INR only throughout (hardcoded in formatCurrency and backend config)
- Platform fees: 5%, min ₹100, max ₹5,000
- Only two platforms supported: Instagram and YouTube

### Database

MongoDB via Prisma ODM. Schema at `apps/backend/prisma/schema.prisma`.

Key models: User, Listing, Transaction, Offer, Message, Conversation, Review, Dispute, Notification, Favorite, AuditLog. Seed script uses Clerk auth (requires `clerkId`, no password hashing).

## Conventions

- Shared types in `packages/types/src/index.ts` — rebuild types (`pnpm --filter @socialswapr/types build`) after changes
- Backend ESLint allows `@typescript-eslint/no-explicit-any` — prefix unused vars with `_`
- Frontend uses path alias `@/*` → `./src/*`
- Turbo caches `build` and `test` tasks; `dev` is persistent/uncached

## Deployment

Azure-based: Bicep templates in `infra/`, GitHub Actions CI/CD in `.github/workflows/deploy.yml`. Docker images built for both apps (Node 20 Alpine), pushed to Azure Container Registry, deployed to App Service.
