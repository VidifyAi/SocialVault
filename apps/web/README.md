# SocialVault Web

Next.js 14 frontend application for SocialVault marketplace with Clerk authentication.

## Features

- **Framework**: Next.js 14 with App Router
- **Authentication**: Clerk integration with middleware
- **Styling**: Tailwind CSS
- **TypeScript**: Full type safety

## Prerequisites

- Node.js 20+
- pnpm 9+

## Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual Clerk credentials
   ```

3. **Start development server:**
   ```bash
   pnpm dev
   ```

The application will be available at `http://localhost:3000`

## Environment Variables

See `.env.example` for all required environment variables:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key (public)
- `CLERK_SECRET_KEY`: Clerk secret key (server-side)
- `NEXT_PUBLIC_API_URL`: Backend API URL

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Lint code
- `pnpm test` - Run tests

## Project Structure

```
src/
├── app/              # Next.js 14 App Router pages
│   ├── layout.tsx    # Root layout with ClerkProvider
│   ├── page.tsx      # Home page
│   └── globals.css   # Global styles
├── components/       # React components
└── middleware.ts     # Clerk authentication middleware
```

## Authentication

The application uses Clerk for authentication:
- Middleware protects routes automatically
- Public routes: `/`, `/api/health`
- All other routes require authentication

## Styling

Tailwind CSS is configured for styling. Global styles are in `src/app/globals.css`.

## Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## Building for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## License

MIT
