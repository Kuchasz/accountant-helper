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

# Copy necessary files from builder
COPY --from=builder /app/packages/api/dist ./dist
COPY --from=builder /app/packages/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Create data directory for SQLite
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=/app/data/db.sqlite

EXPOSE 3000

CMD ["node", "dist/index.js"]
