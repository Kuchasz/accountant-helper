# Accountant Helper

Accountant Helper is a full-stack workspace for accounting office utilities. It combines a React dashboard with an Express/tRPC API, local SQLite settings storage, optional SQL Server connections to Comarch Optima and Platnik databases, XML cleanup tools, document compression, and VAT declaration status tracking.

## Tech Stack

### Frontend (`packages/web`)
- React 18 with TypeScript
- Vite
- Tailwind CSS
- Base UI primitives
- TanStack Router
- TanStack Query and tRPC React Query
- i18next and react-i18next

### Backend (`packages/api`)
- Node.js with Express
- tRPC
- TypeORM
- Local SQLite database through `better-sqlite3`
- Optional Microsoft SQL Server connections through `mssql`
- Vitest
- Ghostscript and Sharp for document compression

### Tooling
- pnpm workspaces
- Biome for linting and formatting
- TypeScript
- Docker and Docker Compose

## Project Structure

```text
accountant-helper/
├── packages/
│   ├── api/                 # Express + tRPC API
│   │   ├── src/
│   │   │   ├── db/          # TypeORM entities and data sources
│   │   │   ├── jobs/        # Background job scheduler
│   │   │   ├── services/    # Domain services, including JPK VAT status refresh
│   │   │   ├── router.ts    # tRPC procedures
│   │   │   └── index.ts     # Express server and REST endpoints
│   │   └── data/            # Local SQLite database file
│   └── web/                 # Vite + React app
│       ├── src/
│       │   ├── components/  # Dashboard, sidebar, and shared UI
│       │   ├── contexts/    # Theme, language, and sidebar context
│       │   ├── i18n/        # English and Polish translations
│       │   ├── lib/         # tRPC client and frontend helpers
│       │   ├── pages/       # Settings, tools, ZUS, and Optima pages
│       │   ├── router.tsx   # TanStack Router routes
│       │   └── main.tsx     # Entry point
│       ├── Caddyfile
│       └── Dockerfile
├── docs/                    # Reference schemas for Optima and Platnik databases
├── pnpm-workspace.yaml
├── biome.json
└── docker-compose.yml
```

## Prerequisites

- Node.js 22+ recommended. The project still declares `>=20`, but Node.js 20 reached upstream end-of-life on April 30, 2026. Docker builds use Node.js 24.
- pnpm 10.15.1 via Corepack, matching `packageManager` in `package.json`.
- Ghostscript (`gs`) for local PDF compression development.
- Access to SQL Server databases only if you want Optima or Platnik integration features.

## Installation

```bash
pnpm install
```

The local SQLite schema is created automatically by TypeORM on API startup. There are currently no `db:generate`, `db:migrate`, or Drizzle Studio scripts in this workspace.

## Development

Start the frontend and backend together:

```bash
pnpm dev
```

Or start one package at a time:

```bash
cd packages/api
pnpm dev

cd packages/web
pnpm dev
```

Default local URLs:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- tRPC endpoint: http://localhost:3000/trpc
- Health check: http://localhost:3000/health

## Application Features

- Dashboard cards for payer and VAT declaration status.
- SQL Server connection settings for Optima and Platnik databases.
- Optima company database discovery from the Optima configuration database.
- VAT declaration due-date settings and scheduled JPK VAT declaration status refreshes.
- ZUS payer list view backed by the Platnik database.
- XML fixer for clearing `BAZA_ZRD_ID` and `BAZA_DOC_ID` values before Optima import.
- PDF/image document compressor at `POST /compress-pdf`.
- English and Polish UI translations.

## Environment Variables

### Backend (`packages/api/.env`)

These `.env` database connection values are for local development. In production, the Docker Compose file supplies the SQLite `DATABASE_URL`, and Optima/Platnik SQL Server connections should be saved through the Settings page.

```env
PORT=3000
DATABASE_URL=./data/db.sqlite
NODE_ENV=development

# Comarch Optima SQL Server configuration database, development only.
OPTIMA_CONFIG_SERVER=
OPTIMA_CONFIG_DATABASE=
OPTIMA_CONFIG_USER=
OPTIMA_CONFIG_PASSWORD=
OPTIMA_CONFIG_PORT=1433
OPTIMA_CONFIG_ENCRYPT=true
OPTIMA_CONFIG_TRUST_SERVER_CERTIFICATE=false

# Example Comarch Optima company database, development only.
OPTIMA_COMPANY_SERVER=
OPTIMA_COMPANY_DATABASE=
OPTIMA_COMPANY_USER=
OPTIMA_COMPANY_PASSWORD=
OPTIMA_COMPANY_PORT=1433
OPTIMA_COMPANY_ENCRYPT=true
OPTIMA_COMPANY_TRUST_SERVER_CERTIFICATE=false

# Platnik SQL Server database, development only.
PAYER_DB_SERVER=
PAYER_DB_DATABASE=
PAYER_DB_USER=
PAYER_DB_PASSWORD=
PAYER_DB_PORT=1433
PAYER_DB_ENCRYPT=true
PAYER_DB_TRUST_SERVER_CERTIFICATE=false
```

The external database environment variable fallbacks are intentionally disabled outside development.

### Frontend (`packages/web/.env`)

```env
VITE_API_URL=http://localhost:3000
```

When the frontend is served by the Docker Caddy container, `/trpc`, `/compress-pdf`, and `/health` are proxied to the API container, so `VITE_API_URL` can be omitted for same-origin requests.

## Running With Docker Compose

The easiest production-like run is Docker Compose. It pulls the published API and web images from Docker Hub, starts the API on port `4005`, starts the web app on port `4006`, and stores the API SQLite database in the `api-data` Docker volume.

```bash
docker-compose up -d
```

Open the app at http://localhost:4006. The web container proxies API requests to the API container, so `/trpc`, `/compress-pdf`, and `/health` work from the same origin.

Useful follow-up commands:

```bash
docker-compose logs -f
docker-compose down
```

If you need to inspect the API directly:

- Backend: http://localhost:4005
- Health check: http://localhost:4005/health

Configure Optima and Platnik SQL Server connections from the Settings page after the containers are running. The API image includes Ghostscript for PDF compression.

## Testing

Run all package tests:

```bash
pnpm test
```

Run tests for one package:

```bash
cd packages/api
pnpm test

cd packages/web
pnpm test
```

## Production Build

```bash
pnpm build
```

This compiles the backend to `packages/api/dist` and builds the frontend to `packages/web/dist`.

## License

MIT
