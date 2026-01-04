# SocialVault

A secure marketplace for buying and selling social media accounts with escrow protection powered by Razorpay and Clerk authentication.

## 🏗️ Architecture

SocialVault is a monorepo built with modern web technologies:

- **Backend**: NestJS (TypeScript) with Prisma ORM
- **Frontend**: Next.js 14 with App Router
- **Authentication**: Clerk
- **Payments**: Razorpay with manual capture for escrow
- **Infrastructure**: Azure (Terraform)
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Package Manager**: pnpm workspaces

## 📁 Project Structure

```
SocialVault/
├── apps/
│   ├── api/              # NestJS backend API
│   └── web/              # Next.js frontend application
├── infra/
│   └── azure/            # Terraform infrastructure code
├── .github/
│   └── workflows/        # CI/CD workflows
├── docker-compose.yml    # Local development services
└── pnpm-workspace.yaml   # pnpm workspace configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/VidifyAi/SocialVault.git
   cd SocialVault
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start local services:**
   ```bash
   docker-compose up -d
   ```

   This starts:
   - PostgreSQL on port 5432
   - Redis on port 6379
   - Mailpit on ports 1025 (SMTP) and 8025 (UI)
   - MinIO on ports 9000 (API) and 9001 (Console)

4. **Set up environment variables:**
   ```bash
   # API
   cp apps/api/.env.example apps/api/.env
   
   # Web
   cp apps/web/.env.example apps/web/.env.local
   ```

5. **Set up the database:**
   ```bash
   cd apps/api
   pnpm prisma:generate
   pnpm prisma:migrate
   ```

6. **Start development servers:**
   ```bash
   # From the root directory
   pnpm dev
   ```

   - API: http://localhost:3001
   - Web: http://localhost:3000

## 🧪 Testing

Run tests for all apps:
```bash
pnpm test
```

Run tests for specific app:
```bash
pnpm --filter @socialvault/api test
pnpm --filter @socialvault/web test
```

## 🏗️ Building

Build all apps:
```bash
pnpm build
```

Build specific app:
```bash
pnpm --filter @socialvault/api build
pnpm --filter @socialvault/web build
```

## 🔍 Linting

Lint all apps:
```bash
pnpm lint
```

## 📦 Services

### API (Backend)

NestJS application with:
- Prisma schema with users, listings, offers, transactions, and messages
- Clerk JWT authentication guard with JWKS validation
- Razorpay payment service with escrow support
- Health check endpoint

See [apps/api/README.md](apps/api/README.md) for details.

### Web (Frontend)

Next.js 14 application with:
- App Router
- Clerk authentication with middleware
- Tailwind CSS for styling
- TypeScript

See [apps/web/README.md](apps/web/README.md) for details.

## 🔐 Environment Variables

### API (`apps/api/.env`)
- `DATABASE_URL`: PostgreSQL connection string
- `CLERK_SECRET_KEY`: Clerk secret key
- `CLERK_DOMAIN`: Your Clerk domain
- `RAZORPAY_KEY_ID`: Razorpay key ID
- `RAZORPAY_KEY_SECRET`: Razorpay secret key

### Web (`apps/web/.env.local`)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key
- `CLERK_SECRET_KEY`: Clerk secret key
- `NEXT_PUBLIC_API_URL`: API base URL

## 🏗️ Infrastructure

Terraform configuration for Azure deployment includes:
- Virtual Network with subnets
- Azure Container Registry (ACR)
- Azure Kubernetes Service (AKS)
- PostgreSQL Flexible Server
- Redis Cache
- Key Vault
- Storage Account

See [infra/azure/README.md](infra/azure/README.md) for infrastructure details.

## 🔄 CI/CD

GitHub Actions workflows:
- **API CI**: Lint, test, and build API on changes
- **Web CI**: Lint, test, and build web on changes
- **Terraform Plan**: Plan infrastructure changes on PRs

## 🧰 Development Tools

- **Mailpit**: Email testing UI at http://localhost:8025
- **MinIO Console**: Object storage UI at http://localhost:9001
- **Prisma Studio**: Database GUI with `pnpm --filter @socialvault/api prisma:studio`

## 📚 Database Schema

The Prisma schema includes:

- **Users**: User accounts with Clerk integration
- **Listings**: Social media accounts for sale
- **Offers**: Purchase offers on listings
- **Transactions**: Payment transactions with Razorpay
- **Messages**: User-to-user messaging

Enums: `UserRole`, `ListingStatus`, `OfferStatus`, `TransactionStatus`, `MessageType`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT

## 🔗 Links

- [Clerk Documentation](https://clerk.com/docs)
- [Razorpay Documentation](https://razorpay.com/docs/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
