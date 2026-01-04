# SocialVault Web

Next.js 14 frontend application for SocialVault marketplace.

## Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Clerk Authentication** with provider and middleware
- **Tailwind CSS** for styling (configured via globals.css)

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key
- `CLERK_SECRET_KEY`: Clerk secret key
- `NEXT_PUBLIC_API_URL`: Backend API URL

### Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint
pnpm lint
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── layout.tsx      # Root layout with Clerk provider
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
└── middleware.ts       # Clerk authentication middleware
```

## Authentication

The app uses Clerk for authentication:

- **ClerkProvider**: Wraps the entire app in `layout.tsx`
- **authMiddleware**: Protects routes in `middleware.ts`
- Configure public routes by updating the `publicRoutes` array

## Adding Protected Routes

Update `src/middleware.ts` to add protected routes:

```typescript
export default authMiddleware({
  publicRoutes: ['/', '/about'],
});
```
