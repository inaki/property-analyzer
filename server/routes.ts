
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { type InsertAnalysis } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.analyses.list.path, async (req, res) => {
    const analyses = await storage.getAnalyses();
    res.json(analyses);
  });

  app.get(api.analyses.get.path, async (req, res) => {
    const analysis = await storage.getAnalysis(Number(req.params.id));
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }
    res.json(analysis);
  });

  app.post(api.analyses.create.path, async (req, res) => {
    try {
      // Coerce numeric strings to numbers if sent as strings
      const coercedSchema = api.analyses.create.input.extend({
        purchasePrice: z.coerce.number(),
        renovationCost: z.coerce.number().optional(),
        closingCosts: z.coerce.number().optional(),
        downPaymentPercent: z.coerce.number(),
        interestRate: z.coerce.number(),
        loanTermYears: z.coerce.number(),
        monthlyRent: z.coerce.number(),
        otherMonthlyIncome: z.coerce.number().optional(),
        vacancyRatePercent: z.coerce.number().optional(),
        managementFeePercent: z.coerce.number().optional(),
        propertyTaxYearly: z.coerce.number().optional(),
        insuranceYearly: z.coerce.number().optional(),
        hoaMonthly: z.coerce.number().optional(),
        utilitiesMonthly: z.coerce.number().optional(),
        maintenancePercent: z.coerce.number().optional(),
        otherMonthlyExpenses: z.coerce.number().optional(),
      });

      const input = coercedSchema.parse(req.body);
      // We need to cast the numeric inputs to strings for the DB if the schema expects numeric/decimal types
      // But drizzle-zod usually handles this. Let's pass the parsed object.
      // Actually, my schema defines numeric columns which return strings in JS, but input numbers are fine.
      // I'll cast them to strings where necessary if type mismatch occurs, but standard insert usually works.
      
      const analysis = await storage.createAnalysis(input as InsertAnalysis);
      res.status(201).json(analysis);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.analyses.delete.path, async (req, res) => {
    await storage.deleteAnalysis(Number(req.params.id));
    res.status(204).send();
  });

  await seedDatabase();

  return httpServer;
}

// Optional seed function
async function seedDatabase() {
  const existing = await storage.getAnalyses();
  if (existing.length === 0) {
    await storage.createAnalysis({
      title: "Sample Investment: San Juan Condo",
      description: "2BR/1BA apartment in Santurce",
      purchasePrice: 250000,
      renovationCost: 15000,
      closingCosts: 5000,
      downPaymentPercent: "20",
      interestRate: "6.5",
      loanTermYears: 30,
      monthlyRent: 2200,
      propertyTaxYearly: 800, // Low PR taxes
      insuranceYearly: 1200,
      hoaMonthly: 150,
      maintenancePercent: "5",
      vacancyRatePercent: "5",
      managementFeePercent: "10"
    });
  }
}
