# Property Analyzer — CLAUDE.md

## Project overview

**Property Analyzer** is a personal finance and real estate analysis toolkit designed for individuals modeling leveraged investment strategies, debt payoff plans, and long-term wealth accumulation. It solves the problem of fragmented financial planning by providing integrated calculators for BUYD (borrow-yield-deploy) strategies, compound growth projections, debt optimization, net worth tracking, and advisory fee impact analysis—all in one React + Express web application.

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

## Directory structure

```
client/src/              React frontend source code
  pages/                 Route-level components (one per wouter route)
  components/            Shared UI and feature sub-components (buyd/, ui/)
  lib/                   Pure business logic (simulateBuyd, formatters, validators)
  hooks/                 React Query hooks for mutations and data fetching
  locales/               i18n translation files (en.json, es.json)
  main.tsx               React app entry point
server/                  Express backend and database layer
  index.ts               Express server entry point
  routes.ts              REST API endpoint definitions
  storage.ts             Drizzle ORM database access layer
shared/                  TypeScript types and interfaces shared client/server
public/                  Static assets (built client bundle in production)
```

## i18n
All user-facing strings live in `client/src/locales/en.json` and `es.json`. Add keys to both files when adding new UI text.

## Build / install

```bash
npm install        # Install dependencies
npm run dev        # Start dev server (Express + Vite HMR) on http://localhost:5000
npm run build      # Production build → dist/ (server) and server/public/ (client)
npm run start      # Run production build
```

**Prerequisites:** Node.js 18+

**Environment:** Uses SQLite in development, PostgreSQL in production. Configure via `.env` for database URL if needed.

## Code conventions

**Naming**
- File names: `camelCase` for utilities and hooks (`simulateBuyd.ts`, `usePortfolioQuery.ts`), `PascalCase` for React components (`BuydSimulator.tsx`)
- Exports: Named exports for utilities, hooks, and types; default export only for page components
- Functions: Verb-prefix for actions (`formatCurrency`, `calculateDscr`, `validateLtv`)

**Imports & organization**
- Group imports: React/third-party, internal components, utilities, types, styles
- Use path aliases (`@/components`, `@/lib`, `@/shared`) defined in `tsconfig.json`
- Avoid circular dependencies between `client/lib` and `components`; keep business logic in `lib/`

**Comments & documentation**
- Add JSDoc for exported functions in `lib/` (especially financial calculators: inputs, outputs, assumptions)
- Explain non-obvious financial logic (e.g., DSCR formula, LTV stress-test thresholds)
- Keep comments concise; prefer clear variable names over explanatory comments

**TypeScript & validation**
- All server routes and storage functions must be typed (use `shared/` types)
- Form inputs and API payloads: validate with schema (e.g., Zod) before use
- Avoid `any`; use `unknown` with type guards if needed

**React conventions**
- Components in `pages/` are route-level; keep them thin, delegate logic to `hooks/` and `components/`
- Hooks in `hooks/` wrap React Query mutations and queries; name them `use*Query` or `use*Mutation`
- UI components in `components/ui/` are presentational (from shadcn); feature components go in `components/{feature}/`

**Localization**
- All user-facing strings (labels, errors, tooltips) must use `useTranslation()` hook
- Add keys to `client/src/locales/{en,es}.json`; do not hardcode strings

**Server conventions**
- Route handlers in `server/routes.ts` should be thin; delegate to `storage.ts` for DB access and `lib/` for logic
- HTTP status codes: 200 (success), 400 (bad request), 404 (not found), 500 (server error)

## Common tasks / recipes

**Adding a new calculator page**
1. Create a new page component in `client/src/pages/` (e.g., `MyCalculator.tsx`)
2. Import and add the route in `client/src/App.tsx` using wouter's `<Route path="/my-calc" component={MyCalculator} />`
3. Add navigation link to the sidebar in `client/src/components/Sidebar.tsx`
4. Place feature logic in `client/src/lib/` (e.g., `myCalculatorLogic.ts`) and UI sub-components in `client/src/components/my-calculator/`
5. Use React Query hooks in `client/src/hooks/` if the calculator needs to fetch or persist data

**Adding a new API endpoint**
1. Define the route handler in `server/routes.ts` (e.g., `app.post('/api/calculate', ...)`)
2. If data needs persistence, add a Drizzle table schema in `server/storage.ts` and run `npm run db:push`
3. Import and call storage functions from the route handler
4. Create a corresponding React Query mutation hook in `client/src/hooks/` for client-side calls

**Adding i18n strings (English + Spanish)**
1. Add key-value pairs to `client/src/locales/en.json` and `client/src/locales/es.json`
2. Import `useTranslation` from `react-i18next` in the component: `const { t } = useTranslation()`
3. Use `t('your.key')` in JSX; the active language is switched via the language selector in the UI

**Styling a new component**
1. Use Tailwind CSS utility classes directly in JSX
2. For shadcn/ui components, install via `npx shadcn-ui@latest add <component>` and import from `@/components/ui/`
3. Complex layouts should live in `client/src/components/` with sub-folders by feature (e.g., `buyd/`, `balance-sheet/`)

**Running the full stack locally**
1. `npm install` to install dependencies
2. `npm run dev` starts Express (port 5000) + Vite HMR for instant client reloads
3. Open `http://localhost:5000` in your browser; changes to `client/src/` and `server/` hot-reload automatically

## External APIs & integrations

**None currently configured.** Property Analyzer is a self-contained application with no outbound API dependencies or third-party service integrations.

All calculations (BUYD simulation, debt optimization, compound interest, balance sheet) are performed client-side or in-process on the Express server. Data persistence uses a local SQLite database (development) or PostgreSQL (production) — both managed via Drizzle ORM.

**Internationalization** is handled locally via react-i18next with static locale JSON files (English and Spanish) bundled at build time.

If external integrations are added in the future (e.g., real estate data APIs, rate feeds, or financial data providers), credentials should be stored in environment variables and documented here with their purpose and configuration location.
