
import { db } from "./db";
import { type InsertAnalysis, type Analysis } from "@shared/schema";

type AnalysisRow = {
  id: number;
  title: string;
  description: string | null;
  purchase_price: number;
  renovation_cost: number | null;
  closing_costs: number | null;
  down_payment_percent: number;
  interest_rate: number;
  loan_term_years: number;
  monthly_rent: number;
  other_monthly_income: number | null;
  vacancy_rate_percent: number | null;
  management_fee_percent: number | null;
  property_tax_yearly: number | null;
  insurance_yearly: number | null;
  hoa_monthly: number | null;
  utilities_monthly: number | null;
  maintenance_percent: number | null;
  other_monthly_expenses: number | null;
  created_at: string;
};

function toNumber(value: number | string | undefined | null, fallback = 0) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toAnalysis(row: AnalysisRow): Analysis {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? null,
    purchasePrice: row.purchase_price,
    renovationCost: row.renovation_cost ?? 0,
    closingCosts: row.closing_costs ?? 0,
    downPaymentPercent: String(row.down_payment_percent),
    interestRate: String(row.interest_rate),
    loanTermYears: row.loan_term_years,
    monthlyRent: row.monthly_rent,
    otherMonthlyIncome: row.other_monthly_income ?? 0,
    vacancyRatePercent: String(row.vacancy_rate_percent ?? 5),
    managementFeePercent: String(row.management_fee_percent ?? 0),
    propertyTaxYearly: row.property_tax_yearly ?? 0,
    insuranceYearly: row.insurance_yearly ?? 0,
    hoaMonthly: row.hoa_monthly ?? 0,
    utilitiesMonthly: row.utilities_monthly ?? 0,
    maintenancePercent: String(row.maintenance_percent ?? 5),
    otherMonthlyExpenses: row.other_monthly_expenses ?? 0,
    createdAt: row.created_at,
  };
}

export interface IStorage {
  getAnalyses(): Promise<Analysis[]>;
  getAnalysis(id: number): Promise<Analysis | undefined>;
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  deleteAnalysis(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getAnalyses(): Promise<Analysis[]> {
    const rows = db
      .prepare("SELECT * FROM analyses ORDER BY created_at DESC")
      .all() as AnalysisRow[];
    return rows.map(toAnalysis);
  }

  async getAnalysis(id: number): Promise<Analysis | undefined> {
    const row = db
      .prepare("SELECT * FROM analyses WHERE id = ?")
      .get(id) as AnalysisRow | undefined;
    return row ? toAnalysis(row) : undefined;
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const createdAt = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO analyses (
        title,
        description,
        purchase_price,
        renovation_cost,
        closing_costs,
        down_payment_percent,
        interest_rate,
        loan_term_years,
        monthly_rent,
        other_monthly_income,
        vacancy_rate_percent,
        management_fee_percent,
        property_tax_yearly,
        insurance_yearly,
        hoa_monthly,
        utilities_monthly,
        maintenance_percent,
        other_monthly_expenses,
        created_at
      ) VALUES (
        @title,
        @description,
        @purchase_price,
        @renovation_cost,
        @closing_costs,
        @down_payment_percent,
        @interest_rate,
        @loan_term_years,
        @monthly_rent,
        @other_monthly_income,
        @vacancy_rate_percent,
        @management_fee_percent,
        @property_tax_yearly,
        @insurance_yearly,
        @hoa_monthly,
        @utilities_monthly,
        @maintenance_percent,
        @other_monthly_expenses,
        @created_at
      )
    `);

    const result = stmt.run({
      title: insertAnalysis.title,
      description: insertAnalysis.description ?? null,
      purchase_price: toNumber(insertAnalysis.purchasePrice),
      renovation_cost: toNumber(insertAnalysis.renovationCost),
      closing_costs: toNumber(insertAnalysis.closingCosts),
      down_payment_percent: toNumber(insertAnalysis.downPaymentPercent),
      interest_rate: toNumber(insertAnalysis.interestRate),
      loan_term_years: toNumber(insertAnalysis.loanTermYears),
      monthly_rent: toNumber(insertAnalysis.monthlyRent),
      other_monthly_income: toNumber(insertAnalysis.otherMonthlyIncome),
      vacancy_rate_percent: toNumber(insertAnalysis.vacancyRatePercent, 5),
      management_fee_percent: toNumber(insertAnalysis.managementFeePercent),
      property_tax_yearly: toNumber(insertAnalysis.propertyTaxYearly),
      insurance_yearly: toNumber(insertAnalysis.insuranceYearly),
      hoa_monthly: toNumber(insertAnalysis.hoaMonthly),
      utilities_monthly: toNumber(insertAnalysis.utilitiesMonthly),
      maintenance_percent: toNumber(insertAnalysis.maintenancePercent, 5),
      other_monthly_expenses: toNumber(insertAnalysis.otherMonthlyExpenses),
      created_at: createdAt,
    });

    const insertedId = Number(result.lastInsertRowid);
    const analysis = await this.getAnalysis(insertedId);
    if (!analysis) {
      throw new Error("Failed to create analysis.");
    }

    return analysis;
  }

  async deleteAnalysis(id: number): Promise<void> {
    db.prepare("DELETE FROM analyses WHERE id = ?").run(id);
  }
}

export const storage = new DatabaseStorage();
