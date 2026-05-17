# Property Analyzer — CLAUDE.md

## What this project is
A React + Express financial analysis tool with multiple calculators: BUYD leverage simulator, debt optimizer, compound interest, balance sheet, personal finance tracker, and advisory fee calculator.

## Commands
```bash
npm run dev        # Start dev server (Express + Vite HMR), port 5000
npm run build      # Production build → dist/
npm run start      # Run production build from dist/
npm run check      # TypeScript type-check
npm run lint       # ESLint
npm run db:push    # Push Drizzle schema to database
```

## Architecture
```
client/src/
  pages/          # Route-level components (one per wouter route)
  components/     # Shared UI + feature sub-components (buyd/, ui/)
  lib/            # Pure business logic (simulateBuyd, formatters, etc.)
  hooks/          # React Query mutation/query hooks
  locales/        # i18n JSON files (en.json, es.json)
server/
  index.ts        # Express entry point
  routes.ts       # REST API routes
  storage.ts      # DB access layer (Drizzle + SQLite/Postgres)
shared/           # Types shared between client and server
```

## Stack
- **Client**: React 18, Vite, wouter, Tailwind CSS 3, shadcn/ui (Radix), recharts, react-i18next
- **Server**: Express 4, Drizzle ORM, better-sqlite3 (dev) / PostgreSQL (prod)
- **Build tooling**: esbuild bundles the server; Vite bundles the client

## Generated directories — do not commit
- `dist/` — production build output from `npm run build` (server bundle + client assets)
- `server/public/` — Vite client build copied here during `npm run build`

Both are listed in `.gitignore`.

## i18n
All user-facing strings live in `client/src/locales/en.json` and `es.json`. Add keys to both files when adding new UI text.
