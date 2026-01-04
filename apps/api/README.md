# SocialVault API

NestJS backend service for SocialVault marketplace.

## Features

- **Prisma ORM** with PostgreSQL
- **Clerk Authentication** with JWT guard and JWKS verification
- **Razorpay Payments** with escrow support (manual capture)
- Health check endpoint

## Prisma Schema

The database includes:
- Users (with Clerk integration)
- Listings (social media accounts for sale)
- Offers (buyer offers on listings)
- Transactions (with Razorpay integration)
- Messages (buyer-seller communication)

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 15+

### Installation

```bash
# Install dependencies
pnpm install

# Generate Prisma client
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL`: PostgreSQL connection string
- `CLERK_JWKS_URL`: Clerk JWKS endpoint for JWT verification
- `CLERK_SECRET_KEY`: Clerk API secret key
- `RAZORPAY_KEY_ID`: Razorpay API key ID
- `RAZORPAY_KEY_SECRET`: Razorpay API key secret

### Development

```bash
# Start in development mode
pnpm start:dev

# Run tests
pnpm test

# Run e2e tests
pnpm test:e2e

# Lint
pnpm lint

# Build
pnpm build
```

### API Endpoints

- `GET /health` - Health check endpoint

## Architecture

- **ClerkAuthGuard**: JWT authentication guard using JWKS verification
- **PaymentsService**: Razorpay integration with escrow functionality
  - `createOrder()`: Create order with manual capture
  - `verifySignature()`: HMAC signature verification
  - `capturePayment()`: Release funds from escrow
  - `refundPayment()`: Refund payment to buyer

## Database Schema

Run Prisma Studio to explore the database:

```bash
pnpm prisma:studio
```
