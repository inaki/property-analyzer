import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Calculator } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CompoundInterestInputsPanel } from "@/components/growth/CompoundInterestInputsPanel";
import { CompoundInterestResultsPanel } from "@/components/growth/CompoundInterestResultsPanel";

const rateScenarios = [4, 6, 8, 10, 12];
const milestoneYears = [5, 10, 15, 20, 25];

function calculateCompoundInterest(
  principal: number,
  annualRate: number,
  frequency: number,
  years: number,
) {
  if (principal <= 0) return 0;
  if (annualRate <= 0) return principal;
  return principal * Math.pow(1 + annualRate / frequency, frequency * years);
}

function calculateMonthlyContributions(
  monthlyInvestment: number,
  annualRate: number,
  years: number,
) {
  const monthlyRate = annualRate / 12;
  const totalMonths = years * 12;

  if (monthlyRate === 0) {
    return monthlyInvestment * totalMonths;
  }

  return (
    monthlyInvestment *
    ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) *
    (1 + monthlyRate)
  );
}

function calculatePRTax(grossAnnual: number): number {
  const exemption = 3500;
  const taxable = Math.max(0, grossAnnual - exemption);
  if (taxable <= 9000) return 0;
  if (taxable <= 25000) return (taxable - 9000) * 0.07;
  if (taxable <= 41500) return 1120 + (taxable - 25000) * 0.14;
  if (taxable <= 61500) return 3430 + (taxable - 41500) * 0.25;
  return 8430 + (taxable - 61500) * 0.33;
}

export default function CompoundInterest() {
  const { t } = useTranslation();
  const [monthlyInvestment, setMonthlyInvestment] = useState("500");
  const [startingBalance, setStartingBalance] = useState("5000");
  const [currentAge, setCurrentAge] = useState("30");
  const [inflationRate, setInflationRate] = useState("2.5");
  const [compoundingFrequency, setCompoundingFrequency] = useState("12");
  const [withdrawalRate, setWithdrawalRate] = useState("0");
  const [selectedBudgetYear, setSelectedBudgetYear] = useState(0);

  const parsedMonthlyInvestment = parseFloat(monthlyInvestment) || 0;
  const parsedStartingBalance = parseFloat(startingBalance) || 0;
  const parsedAge = parseInt(currentAge, 10) || 0;
  const parsedInflationRate = parseFloat(inflationRate) || 0;
  const parsedFrequency = parseInt(compoundingFrequency, 10) || 12;
  const parsedWithdrawalRate = parseFloat(withdrawalRate) || 0;

  const results = useMemo(() => {
    return rateScenarios.map((rate) => {
      const annualRate = rate / 100;

      if (parsedWithdrawalRate > 0) {
        let balance = parsedStartingBalance;
        let milestoneIdx = 0;
        let cumContributions = 0;
        let cumWithdrawn = 0;
        const maxYear = milestoneYears[milestoneYears.length - 1];
        const snapshots: Array<{
          years: number;
          nominal: number;
          real: number;
          totalInvested: number;
          totalWithdrawn: number;
        }> = [];

        for (let y = 1; y <= maxYear; y++) {
          for (let m = 0; m < 12; m++) {
            balance = balance * (1 + annualRate / 12) + parsedMonthlyInvestment;
          }
          cumContributions += parsedMonthlyInvestment * 12;
          const withdrawal = balance * (parsedWithdrawalRate / 100);
          cumWithdrawn += withdrawal;
          balance -= withdrawal;

          if (y === milestoneYears[milestoneIdx]) {
            snapshots.push({
              years: y,
              nominal: balance,
              real: balance / Math.pow(1 + parsedInflationRate / 100, y),
              totalInvested: cumContributions,
              totalWithdrawn: cumWithdrawn,
            });
            milestoneIdx++;
          }
        }
        return snapshots;
      }

      return milestoneYears.map((years) => {
        const initialBalance = calculateCompoundInterest(
          parsedStartingBalance,
          annualRate,
          parsedFrequency,
          years,
        );
        const contributions = calculateMonthlyContributions(
          parsedMonthlyInvestment,
          annualRate,
          years,
        );
        const nominal = initialBalance + contributions;
        const real = nominal / Math.pow(1 + parsedInflationRate / 100, years);
        const totalInvested = parsedMonthlyInvestment * 12 * years;
        return {
          years,
          nominal,
          real,
          totalInvested,
          totalWithdrawn: 0,
        };
      });
    });
  }, [
    parsedStartingBalance,
    parsedMonthlyInvestment,
    parsedInflationRate,
    parsedFrequency,
    parsedWithdrawalRate,
  ]);

  const ages = milestoneYears.map((years) => parsedAge + years);

  const totalInvested = milestoneYears.map(
    (years) => parsedMonthlyInvestment * 12 * years,
  );

  const initialBalanceGrowth = milestoneYears.map((years) => {
    if (parsedWithdrawalRate > 0) {
      let balance = parsedStartingBalance;
      for (let y = 0; y < years; y++) {
        for (let m = 0; m < 12; m++) {
          balance = balance * (1 + 0.08 / 12);
        }
        balance -= balance * (parsedWithdrawalRate / 100);
      }
      return balance;
    }
    return calculateCompoundInterest(parsedStartingBalance, 0.08, parsedFrequency, years);
  });

  const budgetData = useMemo(() => {
    if (parsedWithdrawalRate <= 0) return null;
    const annualRate = 0.08;
    const totalYears = 20;
    let balance = parsedStartingBalance;
    const snapshots: Array<{
      year: number;
      balance: number;
      grossMonthly: number;
      grossAnnual: number;
      netMonthly: number;
      netAnnual: number;
      netWeekly: number;
      netDaily: number;
      tax: number;
    }> = [];

    for (let y = 1; y <= totalYears; y++) {
      for (let m = 0; m < 12; m++) {
        balance = balance * (1 + annualRate / 12) + parsedMonthlyInvestment;
      }
      const grossAnnual = balance * (parsedWithdrawalRate / 100);
      balance -= grossAnnual;

      const grossMonthly = grossAnnual / 12;
      const tax = calculatePRTax(grossAnnual);
      const netAnnual = grossAnnual - tax;
      const netMonthly = netAnnual / 12;
      const netWeekly = netAnnual / 52;
      const netDaily = netAnnual / 365;

      snapshots.push({
        year: y,
        balance,
        grossMonthly,
        grossAnnual,
        netMonthly,
        netAnnual,
        netWeekly,
        netDaily,
        tax,
      });
    }
    return snapshots;
  }, [
    parsedStartingBalance,
    parsedMonthlyInvestment,
    parsedWithdrawalRate,
  ]);

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Calculator className="h-4 w-4" />
            {t("growth.badge")}
          </div>
          <h1 className="text-3xl font-display font-bold">{t("growth.title")}</h1>
          <p className="text-muted-foreground">{t("growth.subtitle")}</p>
        </div>

        <CompoundInterestInputsPanel
          monthlyInvestment={monthlyInvestment}
          setMonthlyInvestment={setMonthlyInvestment}
          startingBalance={startingBalance}
          setStartingBalance={setStartingBalance}
          currentAge={currentAge}
          setCurrentAge={setCurrentAge}
          inflationRate={inflationRate}
          setInflationRate={setInflationRate}
          compoundingFrequency={compoundingFrequency}
          setCompoundingFrequency={setCompoundingFrequency}
          withdrawalRate={withdrawalRate}
          setWithdrawalRate={setWithdrawalRate}
          parsedStartingBalance={parsedStartingBalance}
          parsedMonthlyInvestment={parsedMonthlyInvestment}
        />

        <CompoundInterestResultsPanel
          budgetData={budgetData}
          results={results}
          selectedBudgetYear={selectedBudgetYear}
          setSelectedBudgetYear={setSelectedBudgetYear}
          ages={ages}
          totalInvested={totalInvested}
          initialBalanceGrowth={initialBalanceGrowth}
          parsedWithdrawalRate={parsedWithdrawalRate}
          rateScenarios={rateScenarios}
          milestoneYears={milestoneYears}
        />
      </div>
    </Layout>
  );
}
