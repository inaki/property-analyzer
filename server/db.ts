
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dataDir = process.env.DB_DIR
  ? path.resolve(process.env.DB_DIR)
  : path.resolve(process.cwd(), "data");
const dbPath = path.join(dataDir, "property-analyzer.sqlite");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    purchase_price INTEGER NOT NULL,
    renovation_cost INTEGER DEFAULT 0,
    closing_costs INTEGER DEFAULT 0,
    down_payment_percent REAL NOT NULL,
    interest_rate REAL NOT NULL,
    loan_term_years INTEGER NOT NULL,
    monthly_rent INTEGER NOT NULL,
    other_monthly_income INTEGER DEFAULT 0,
    vacancy_rate_percent REAL DEFAULT 5,
    management_fee_percent REAL DEFAULT 0,
    property_tax_yearly INTEGER DEFAULT 0,
    insurance_yearly INTEGER DEFAULT 0,
    hoa_monthly INTEGER DEFAULT 0,
    utilities_monthly INTEGER DEFAULT 0,
    maintenance_percent REAL DEFAULT 5,
    other_monthly_expenses INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );
`);
