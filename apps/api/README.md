# SocialVault API

NestJS backend service for SocialVault marketplace with Clerk authentication and Razorpay payment integration.

## Features

- **Authentication**: Clerk JWT-based authentication with JWKS validation
- **Database**: Prisma ORM with PostgreSQL
- **Payments**: Razorpay integration with escrow support (manual capture)
- **Health Check**: `/health` endpoint for monitoring

## Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+
- Redis 7+ (optional)

## Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

3. **Set up the database:**
   ```bash
   pnpm prisma:generate
   pnpm prisma:migrate
   ```

4. **Start development server:**
   ```bash
   pnpm dev
   ```

The API will be available at `http://localhost:3001`

## Environment Variables

See `.env.example` for all required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `CLERK_SECRET_KEY`: Clerk secret key for JWT verification
- `CLERK_DOMAIN`: Your Clerk domain
- `RAZORPAY_KEY_ID`: Razorpay API key ID
- `RAZORPAY_KEY_SECRET`: Razorpay API secret key

## Available Scripts

- `pnpm dev` - Start development server with watch mode
- `pnpm build` - Build for production
- `pnpm start:prod` - Start production server
- `pnpm lint` - Lint and fix code
- `pnpm test` - Run tests
- `pnpm test:cov` - Run tests with coverage
- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:migrate` - Run database migrations
- `pnpm prisma:studio` - Open Prisma Studio

## API Endpoints

### Health Check
- `GET /health` - Returns service health status

## Database Schema

The Prisma schema includes:
- **Users**: User accounts linked to Clerk
- **Listings**: Social media accounts for sale
- **Offers**: Purchase offers on listings
- **Transactions**: Payment transactions with Razorpay escrow
- **Messages**: User-to-user messaging

## Architecture

- **Guards**: Clerk JWT authentication guard
- **Services**: Razorpay payment service with escrow helpers
- **Models**: Prisma-generated type-safe database models

## Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## License

MIT
