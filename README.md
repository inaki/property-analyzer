# Property Analyzer

A personal finance and real estate analysis toolkit built with React and Express. Includes tools for modelling leveraged asset portfolios, debt payoff strategies, compound growth, balance sheets, and advisory fee impact.

## Features
- **BUYD Simulator** — model borrow-yield-deploy strategies with LTV, DSCR, and cash buffer tracking, stress-test scenarios (rate spikes, asset crashes, income shocks)
- **Compound Interest** — growth projections with contribution schedules
- **Debt Optimizer** — avalanche/snowball payoff modelling
- **Balance Sheet** — net worth tracker
- **Personal Finance** — income vs. expenses overview
- **Advisory Fees** — long-term cost of management fees on a portfolio
- **Formulas** — reference sheet for key financial formulas

## Quick start
```bash
npm install
npm run dev       # starts on http://localhost:5000
```

## Stack
- React 18 + Vite, wouter (routing), Tailwind CSS, shadcn/ui
- Express 4, Drizzle ORM, SQLite (dev) / PostgreSQL (prod)
- react-i18next (English + Spanish)

## Build
```bash
npm run build     # produces dist/ (server) and server/public/ (client)
npm run start     # runs the production build
```
