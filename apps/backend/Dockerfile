# Backend service
FROM node:20-alpine
WORKDIR /app

# OS deps for prisma/bcrypt
RUN apk add --no-cache python3 make g++ openssl

# Enable pnpm
RUN npm install -g pnpm

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy backend workspace
COPY apps/backend/package.json apps/backend/tsconfig.json apps/backend/prisma/schema.prisma apps/backend/prisma/seed.ts apps/backend/ ./apps/backend/

# Copy shared types
COPY packages/types/package.json ./packages/types/

# Install deps (workspace-wide)
RUN pnpm install --recursive

# Build backend
RUN pnpm --filter @socialswapr/backend run build

# Runtime env
ENV NODE_ENV=production
WORKDIR /app/apps/backend

EXPOSE 3001
CMD ["pnpm", "start"]
