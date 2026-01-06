# Frontend service
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache python3 make g++
RUN npm install -g pnpm

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy frontend workspace
COPY apps/frontend/package.json apps/frontend/tsconfig.json apps/frontend/next.config.js apps/frontend/postcss.config.js apps/frontend/tailwind.config.ts ./apps/frontend/

# Copy shared types
COPY packages/types/package.json ./packages/types/

# Copy app source
COPY apps/frontend/src ./apps/frontend/src
COPY apps/frontend/public ./apps/frontend/public

# Install deps (workspace-wide)
RUN pnpm install --recursive

# Build frontend
RUN pnpm --filter @socialswapr/frontend run build

ENV NODE_ENV=production
WORKDIR /app/apps/frontend
EXPOSE 3000
CMD ["sh", "-c", "node_modules/.bin/next start -p ${PORT:-3000} -H 0.0.0.0"]
