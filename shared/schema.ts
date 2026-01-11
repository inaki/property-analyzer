
import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  
  // Purchase Info
  purchasePrice: integer("purchase_price").notNull(),
  renovationCost: integer("renovation_cost").default(0),
  closingCosts: integer("closing_costs").default(0),
  
  // Financing
  downPaymentPercent: numeric("down_payment_percent").notNull(), // e.g. 20 for 20%
  interestRate: numeric("interest_rate").notNull(), // e.g. 6.5 for 6.5%
  loanTermYears: integer("loan_term_years").notNull(),
  
  // Income
  monthlyRent: integer("monthly_rent").notNull(),
  otherMonthlyIncome: integer("other_monthly_income").default(0),
  vacancyRatePercent: numeric("vacancy_rate_percent").default(5),
  
  // Expenses
  managementFeePercent: numeric("management_fee_percent").default(0),
  propertyTaxYearly: integer("property_tax_yearly").default(0), // CRIM
  insuranceYearly: integer("insurance_yearly").default(0),
  hoaMonthly: integer("hoa_monthly").default(0),
  utilitiesMonthly: integer("utilities_monthly").default(0),
  maintenancePercent: numeric("maintenance_percent").default(5),
  otherMonthlyExpenses: integer("other_monthly_expenses").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAnalysisSchema = createInsertSchema(analyses).omit({ 
  id: true, 
  createdAt: true 
});

export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;

// Derived metrics for API response (optional, but good to have types)
export interface FinancialMetrics {
  monthlyMortgage: number;
  monthlyExpenses: number;
  monthlyNOI: number; // Net Operating Income
  monthlyCashFlow: number;
  capRate: number;
  cashOnCash: number;
  totalInitialInvestment: number;
}
