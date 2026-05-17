# Frontend Dockerfile
FROM node:24-alpine AS base

# Install pnpm and native build dependencies for API types imported by the web app
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate && \
    apk add --no-cache python3 make g++

FROM base AS builder
WORKDIR /app

# Copy root package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./

# Copy frontend package files
COPY packages/web/package.json ./packages/web/
COPY packages/api/package.json ./packages/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy frontend source
COPY packages/web ./packages/web
COPY packages/api ./packages/api
COPY biome.json ./

# Build
WORKDIR /app/packages/web
RUN pnpm build

FROM caddy:2-alpine AS runner

# Copy built files to Caddy's site root
COPY --from=builder /app/packages/web/dist /srv

# Copy Caddy config
COPY packages/web/Caddyfile /etc/caddy/Caddyfile

EXPOSE 4006

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
