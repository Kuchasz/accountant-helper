# Frontend Dockerfile
FROM node:24-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate

FROM base AS builder
WORKDIR /app

# Copy root package files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./

# Copy frontend package files
COPY packages/web/package.json ./packages/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy frontend source
COPY packages/web ./packages/web
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
