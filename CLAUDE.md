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

## Architecture & module map

Property Analyzer is organized as a monorepo with three deployable units: a React client, an Express server, and shared type definitions. The client runs on port 5000 during development and is bundled by Vite for production; the server uses Express to handle REST API calls and database operations via Drizzle ORM. Shared types live in a separate directory to keep both layers in sync without circular dependencies.

The system splits as follows:

- **`client/src/`** — React 18 frontend bundled by Vite
  - `pages/` — Route-level components (one per wouter route: Buyd, Compound, DebtOptimizer, BalanceSheet, PersonalFinance, Advisory, Formulas)
  - `components/` — Shared UI (Tailwind + shadcn/ui) and feature subcomponents (buyd/, ui/)
  - `lib/` — Pure business logic (simulateBuyd, formatters, validators, financial calculations)
  - `hooks/` — React Query mutations and queries for API calls
  - `locales/` — i18n JSON files (en.json, es.json)

- **`server/`** — Express 4 backend
  - `index.ts` — Entry point, middleware setup, port binding
  - `routes.ts` — REST API endpoint definitions
  - `storage.ts` — Data access layer wrapping Drizzle ORM queries

- **`shared/`** — TypeScript type definitions and interfaces used by both client and server

**Production deployment:** The build process generates `dist/` (bundled server) and `server/public/` (bundled client assets). The `npm run start` command runs the compiled server, which serves static assets and API routes from a single process. SQLite is used in development; PostgreSQL in production.

## Stack
- **Client**: React 18, Vite, wouter, Tailwind CSS 3, shadcn/ui (Radix), recharts, react-i18next
- **Server**: Express 4, Drizzle ORM, better-sqlite3 (dev) / PostgreSQL (prod)
- **Build tooling**: esbuild bundles the server; Vite bundles the client

## Directory structure

The repository uses a monorepo layout with client, server, and shared type definitions organized at the top level. Each directory serves a distinct purpose in the React + Express architecture, with clear separation between frontend assets, backend logic, and configuration files.

```
client/                 React 18 frontend (Vite bundled)
├── src/
│   ├── pages/         Route components (Buyd, Compound, DebtOptimizer, etc.)
│   ├── components/    Shared UI and feature subcomponents
│   ├── lib/           Pure business logic and financial calculations
│   ├── hooks/         React Query mutations and API queries
│   └── locales/       i18n JSON (en.json, es.json)
├── index.html         Entry HTML template
└── vite.config.ts     Vite configuration

server/                 Express 4 backend with Drizzle ORM
├── src/
│   ├── index.ts       Entry point, middleware, port binding
│   ├── routes.ts      REST API endpoint definitions
│   ├── storage.ts     Database schema and queries
│   └── db.ts          Drizzle instance
├── public/            Static assets (client bundle in prod)
└── package.json

shared/                 Shared type definitions
├── types.ts           TypeScript interfaces used by both client and server

.env.example           Environment configuration template
drizzle.config.ts      Drizzle ORM migrations and database config
tsconfig.json          TypeScript configuration
package.json           Dependencies and workspace scripts
```

The `client/` directory contains all React components, pages, and frontend logic; `server/` holds Express routes and database operations; and `shared/` prevents circular dependencies by housing common types. Configuration files at the root level apply to the entire monorepo workspace.

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

## Domain glossary

Financial and real estate terminology used throughout Property Analyzer. These terms have specific meanings in the application's context and are used consistently across calculations, UI labels, and API responses. Understanding these definitions ensures correct interpretation of simulation results and feature interactions.

- **BUYD** — Borrow-Yield-Deploy strategy; a leveraged investment approach where capital is borrowed at one rate, deployed to generate yield, and managed according to debt service coverage ratio (DSCR) and loan-to-value (LTV) constraints.
- **LTV** — Loan-to-Value; the ratio of borrowed amount to total asset value, used to assess leverage risk in BUYD scenarios.
- **DSCR** — Debt Service Coverage Ratio; the ratio of income to debt payments, indicating ability to service debt from cash flow.
- **Cash buffer** — Liquid reserves held to cover shortfalls or unexpected expenses; tracked separately from deployed capital in BUYD stress tests.
- **Stress test** — Scenario modeling that applies shocks (rate spikes, asset price crashes, income shocks) to evaluate portfolio resilience.
- **Avalanche** — Debt payoff strategy prioritizing highest-interest debt first to minimize total interest paid.
- **Snowball** — Debt payoff strategy prioritizing smallest balances first for psychological momentum.
- **Net worth** — Total assets minus total liabilities; the primary metric tracked on the Balance Sheet page.
- **Advisory fees** — Management fees charged as a percentage of assets under management (AUM); the Advisory Fees page models their long-term compounding impact.
- **Compound growth** — Exponential wealth accumulation through reinvested returns and contributions over time.
- **Formulas** — Mathematical reference sheet for key financial calculations (IRR, NPV, compound interest, amortization) used across the toolkit.

## Testing & verification

Property Analyzer currently relies on TypeScript type-checking and linting as its primary code quality gates. Run `npm run check` to validate type safety across the client and server, and `npm run lint` to catch style violations with ESLint. These checks are lightweight and fast, making them suitable for pre-commit hooks and CI pipelines.

Unit and integration tests for business logic (especially financial calculations in `client/src/lib/` and server routes in `server/routes.ts`) should be added using a test runner such as Vitest or Jest. Test files should be colocated with their source modules using the `.test.ts` or `.spec.ts` naming convention.

```bash
npm run check      # TypeScript type-check
npm run lint       # ESLint validation
npm run test       # Run tests (when configured)
```

When setting up tests, prioritize the BUYD simulator logic, debt payoff calculations, and compound interest formulas in `lib/`, as these are critical financial functions that must produce correct results under various input scenarios and edge cases.

## Deployment / ops

Property Analyzer deploys as a monorepo with both client and server artifacts. The production build process compiles the React frontend via Vite into `dist/` and stages the Express server alongside it. The application runs on a single Node process that serves both the API and static assets.

The build and deployment workflow follows these steps:

```bash
npm run build      # Compile React client (dist/) and prepare server bundle
npm run start      # Launch production server from dist/ on port 5000
npm run db:push    # Migrate schema to production database before startup
```

**Environment configuration:** The application supports SQLite for local development and PostgreSQL for production. Database connection is managed via environment variables (DATABASE_URL). The deployment environment should set `NODE_ENV=production` to enable minification and disable hot module reloading.

**Branch model:** Development occurs on feature branches and merges to main via pull request. The `npm run start` command is the canonical production entry point and should be invoked after `npm run build` completes successfully. No manual database setup is required if `npm run db:push` executes before the server starts, as Drizzle ORM handles schema synchronization.
