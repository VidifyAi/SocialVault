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

# Copy shared types (everything) so workspace builds in-container
COPY packages/types ./packages/types

# Install deps (workspace-wide)
RUN pnpm install --recursive

# Build shared types then generate Prisma client and build backend
ENV DATABASE_URL="mongodb://placeholder:27017/dev"
RUN ls -R packages/types \
	&& pnpm --filter @socialswapr/types run build \
	&& pnpm --filter @socialswapr/backend exec prisma generate \
	&& pnpm --filter @socialswapr/backend run build

# Runtime env
ENV NODE_ENV=production
WORKDIR /app/apps/backend

EXPOSE 3001
CMD ["pnpm", "start"]
