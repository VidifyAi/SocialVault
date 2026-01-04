# SocialVault

Secure marketplace for buying and selling social media accounts with escrow payments.

## Project Structure

This is a monorepo managed with pnpm workspaces containing:

- **apps/api**: NestJS backend with Prisma, Clerk auth, and Razorpay payments
- **apps/web**: Next.js 14 frontend with Clerk integration
- **infra/azure**: Terraform infrastructure for Azure deployment

## Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose (for local development)

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Local Services

Start PostgreSQL, Redis, Mailpit, and MinIO:

```bash
docker-compose up -d
```

### 3. Configure Environment

Copy example env files and configure:

```bash
# API
cp apps/api/.env.example apps/api/.env

# Web
cp apps/web/.env.example apps/web/.env.local
```

### 4. Setup Database

```bash
cd apps/api
pnpm prisma:generate
pnpm prisma:migrate
```

### 5. Start Development Servers

```bash
# Start all apps
pnpm dev

# Or individually
pnpm --filter @socialvault/api start:dev
pnpm --filter @socialvault/web dev
```

## Services

- **API**: http://localhost:4000
- **Web**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Mailpit UI**: http://localhost:8025
- **MinIO Console**: http://localhost:9001

## Architecture

### Backend (apps/api)

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk JWT with JWKS verification
- **Payments**: Razorpay with escrow support (manual capture)
- **Features**:
  - User management with Clerk integration
  - Listing management for social media accounts
  - Offer/bidding system
  - Transaction handling with escrow
  - Messaging between buyers and sellers

### Frontend (apps/web)

- **Framework**: Next.js 14 with App Router
- **Authentication**: Clerk provider and middleware
- **Styling**: Tailwind CSS
- **Features**:
  - User authentication and profile
  - Browse and search listings
  - Make offers
  - Secure checkout with Razorpay

### Infrastructure (infra/azure)

Terraform modules for Azure deployment:

- **Network**: VNet with subnets for AKS, PostgreSQL, and Redis
- **ACR**: Azure Container Registry for Docker images
- **AKS**: Azure Kubernetes Service for container orchestration
- **PostgreSQL**: Azure Database for PostgreSQL Flexible Server
- **Redis**: Azure Cache for Redis
- **Key Vault**: Secure secrets management
- **Storage**: Azure Storage for file uploads

## Development

### Build

```bash
# Build all apps
pnpm build

# Build specific app
pnpm --filter @socialvault/api build
pnpm --filter @socialvault/web build
```

### Lint

```bash
# Lint all apps
pnpm lint

# Lint specific app
pnpm --filter @socialvault/api lint
pnpm --filter @socialvault/web lint
```

### Test

```bash
# Test all apps
pnpm test

# Test specific app
pnpm --filter @socialvault/api test
pnpm --filter @socialvault/web test
```

### Format Prisma Schema

```bash
cd apps/api
pnpm prisma:format
```

## CI/CD

GitHub Actions workflows:

- **API CI**: Lint, test, and build on changes to apps/api
- **Web CI**: Lint, test, and build on changes to apps/web
- **Terraform Plan**: Validate and plan infrastructure changes

## Infrastructure Deployment

### Prerequisites

- Azure CLI authenticated
- Terraform 1.6+
- Configure Azure OIDC secrets in GitHub:
  - `AZURE_CLIENT_ID`
  - `AZURE_TENANT_ID`
  - `AZURE_SUBSCRIPTION_ID`

### Deploy

```bash
cd infra/azure

# Initialize Terraform
terraform init

# Plan changes
terraform plan

# Apply changes
terraform apply
```

## Environment Variables

See individual README files for detailed environment configuration:

- [apps/api/README.md](apps/api/README.md)
- [apps/web/README.md](apps/web/README.md)

## Security

- No secrets are committed to the repository
- Use `.env.example` files as templates
- Razorpay webhook signatures are verified using HMAC
- Clerk JWT tokens are validated using JWKS
- Payments use manual capture for escrow functionality

## License

Private - All rights reserved
