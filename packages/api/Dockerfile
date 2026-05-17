# Backend Dockerfile
FROM node:24-alpine AS base

# Install pnpm, runtime tools, and native build dependencies
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate && \
    apk add --no-cache ghostscript python3 make g++

FROM base AS builder
WORKDIR /app

# Copy root package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./

# Copy backend package files
COPY packages/api/package.json ./packages/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy backend source
COPY packages/api ./packages/api
COPY biome.json ./

# Build
WORKDIR /app/packages/api
RUN pnpm build

FROM base AS runner
WORKDIR /app

# Copy pnpm workspace dependencies and the API package runtime files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/api/node_modules ./packages/api/node_modules
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/packages/api/package.json ./packages/api/package.json

# Create data directory for SQLite
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=4005
ENV DATABASE_URL=/app/data/db.sqlite

EXPOSE 4005

WORKDIR /app/packages/api

CMD ["node", "dist/index.js"]
