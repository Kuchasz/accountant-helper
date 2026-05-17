# Accountant Helper

A modern full-stack monorepo built with Vite, React, tRPC, Express, TypeScript, and Tailwind CSS.

## Tech Stack

### Frontend (`packages/web`)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **API Client**: tRPC React Query
- **State Management**: TanStack Query (React Query)

### Backend (`packages/api`)
- **Runtime**: Node.js with Express
- **API**: tRPC
- **Database**: SQLite with Drizzle ORM
- **Type Safety**: TypeScript

### Tooling
- **Package Manager**: pnpm with workspaces
- **Linter/Formatter**: Biome
- **Testing**: Vitest
- **Container**: Docker & Docker Compose

## Project Structure

```
accountant-helper/
├── packages/
│   ├── api/                 # Backend Express + tRPC server
│   │   ├── src/
│   │   │   ├── db/          # Database schema and client
│   │   │   ├── router.ts    # tRPC routes
│   │   │   └── index.ts     # Express server
│   │   ├── drizzle/         # Database migrations (generated)
│   │   └── data/            # SQLite database file
│   └── web/                 # Frontend Vite + React app
│       ├── src/
│       │   ├── lib/         # tRPC client setup
│       │   ├── App.tsx      # Main application
│       │   └── main.tsx     # Entry point
│       └── index.html
├── pnpm-workspace.yaml      # pnpm workspace config
├── biome.json               # Biome linter/formatter config
└── docker-compose.yml       # Docker orchestration
```

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up the database:
```bash
cd packages/api
pnpm db:generate
pnpm db:migrate
```

### Development

Start both frontend and backend in development mode:

```bash
# From root directory
pnpm dev
```

Or start them individually:

```bash
# Backend (from root or packages/api)
cd packages/api
pnpm dev

# Frontend (from root or packages/web)
cd packages/web
pnpm dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **tRPC Endpoint**: http://localhost:3000/trpc

### Available Scripts

#### Root Level
- `pnpm dev` - Start all packages in development mode
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm lint:fix` - Lint and fix all packages
- `pnpm format` - Format all files with Biome
- `pnpm test` - Run tests in all packages
- `pnpm type-check` - Type check all packages

#### Backend (`packages/api`)
- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Drizzle Studio (database GUI)
- `pnpm test` - Run tests
- `pnpm type-check` - Type check

#### Frontend (`packages/web`)
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm test` - Run tests
- `pnpm type-check` - Type check

## API Endpoints

The backend exposes the following tRPC procedures:

### `hello`
Query procedure that returns a greeting message.

**Input:**
```typescript
{ name?: string }
```

**Output:**
```typescript
{
  greeting: string;
  timestamp: string;
}
```

### `getUsers`
Query procedure that returns all users from the database.

**Output:**
```typescript
Array<{
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}>
```

### `createUser`
Mutation procedure to create a new user.

**Input:**
```typescript
{
  name: string;
  email: string;
}
```

**Output:**
```typescript
{
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}
```

## Environment Variables

### Backend (`.env`)
```env
PORT=3000
DATABASE_URL=./data/db.sqlite
NODE_ENV=development
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:3000
```

## Docker

Build and run with Docker Compose:

```bash
# Build and start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f
```

When running with Docker:
- Frontend: http://localhost:8080
- Backend: http://localhost:3000

## Database Management

### Generate Migration
After changing the schema in `packages/api/src/db/schema.ts`:

```bash
cd packages/api
pnpm db:generate
```

### Run Migrations
```bash
cd packages/api
pnpm db:migrate
```

### Open Database Studio
```bash
cd packages/api
pnpm db:studio
```

## Testing

Run tests across all packages:

```bash
pnpm test
```

Or run tests in a specific package:

```bash
cd packages/api
pnpm test

cd packages/web
pnpm test
```

## Type Checking

Check types across all packages:

```bash
pnpm type-check
```

## Code Quality

### Linting
```bash
# Check for issues
pnpm lint

# Fix issues automatically
pnpm lint:fix
```

### Formatting
```bash
pnpm format
```

## Production Build

Build all packages for production:

```bash
pnpm build
```

This will:
1. Type check all packages
2. Build the backend to `packages/api/dist`
3. Build the frontend to `packages/web/dist`

## License

MIT
