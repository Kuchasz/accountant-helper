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

FROM nginx:alpine AS runner

# Copy built files to nginx
COPY --from=builder /app/packages/web/dist /usr/share/nginx/html

# Copy nginx config
COPY packages/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
