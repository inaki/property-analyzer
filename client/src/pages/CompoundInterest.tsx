import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calculator, ChevronDown, Save, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

type Scenario = {
  id: string;
  name: string;
  monthlyInvestment: string;
  startingBalance: string;
  currentAge: string;
  inflationRate: string;
  compoundingFrequency: string;
  withdrawalRate: string;
};

const rateScenarios = [4, 6, 8, 10, 12];
const milestoneYears = [5, 10, 15, 20, 25];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

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
  const [scenarioName, setScenarioName] = useState("");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [showScenarios, setShowScenarios] = useState(false);
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

  const handleSaveScenario = () => {
    if (!scenarioName.trim()) return;
    const id = crypto.randomUUID();
    setScenarios((prev) => [
      {
        id,
        name: scenarioName.trim(),
        monthlyInvestment,
        startingBalance,
        currentAge,
        inflationRate,
        compoundingFrequency,
        withdrawalRate,
      },
      ...prev,
    ]);
    setScenarioName("");
    setShowScenarios(true);
  };

  const handleLoadScenario = (scenario: Scenario) => {
    setMonthlyInvestment(scenario.monthlyInvestment);
    setStartingBalance(scenario.startingBalance);
    setCurrentAge(scenario.currentAge);
    setInflationRate(scenario.inflationRate);
    setCompoundingFrequency(scenario.compoundingFrequency);
    setWithdrawalRate(scenario.withdrawalRate);
  };

  const handleDeleteScenario = (id: string) => {
    setScenarios((prev) => prev.filter((scenario) => scenario.id !== id));
  };

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

        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">{t("growth.inputs.startingBalance")}</span>
              <Input
                type="number"
                value={startingBalance}
                onChange={(event) => setStartingBalance(event.target.value)}
                placeholder={t("growth.placeholders.startingBalance")}
              />
              <span className="text-xs text-muted-foreground">{t("growth.hints.startingBalance")}</span>
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">{t("growth.inputs.monthlyInvestment")}</span>
              <Input
                type="number"
                value={monthlyInvestment}
                onChange={(event) => setMonthlyInvestment(event.target.value)}
                placeholder={t("growth.placeholders.monthlyInvestment")}
              />
              <span className="text-xs text-muted-foreground">{t("growth.hints.monthlyInvestment")}</span>
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">{t("growth.inputs.currentAge")}</span>
              <Input
                type="number"
                value={currentAge}
                onChange={(event) => setCurrentAge(event.target.value)}
                placeholder={t("growth.placeholders.currentAge")}
              />
              <span className="text-xs text-muted-foreground">{t("growth.hints.currentAge")}</span>
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">{t("growth.inputs.withdrawalRate")}</span>
              <div className="relative">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={withdrawalRate}
                  onChange={(event) => setWithdrawalRate(event.target.value)}
                  placeholder={t("growth.placeholders.withdrawalRate")}
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">%</span>
              </div>
              <span className="text-xs text-muted-foreground">{t("growth.hints.withdrawalRate")}</span>
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">{t("growth.inputs.inflationRate")}</span>
              <div className="relative">
                <Input
                  type="number"
                  value={inflationRate}
                  onChange={(event) => setInflationRate(event.target.value)}
                  placeholder={t("growth.placeholders.inflationRate")}
                />
                <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">%</span>
              </div>
              <span className="text-xs text-muted-foreground">{t("growth.hints.inflationRate")}</span>
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">{t("growth.inputs.compoundingFrequency")}</span>
              <Select value={compoundingFrequency} onValueChange={setCompoundingFrequency}>
                <SelectTrigger>
                  <SelectValue placeholder={t("growth.frequencies.placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t("growth.frequencies.yearly")}</SelectItem>
                  <SelectItem value="4">{t("growth.frequencies.quarterly")}</SelectItem>
                  <SelectItem value="12">{t("growth.frequencies.monthly")}</SelectItem>
                  <SelectItem value="365">{t("growth.frequencies.daily")}</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">{t("growth.hints.compoundingFrequency")}</span>
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">{t("growth.inputs.saveScenario")}</span>
              <div className="flex gap-2">
                <Input
                  value={scenarioName}
                  onChange={(event) => setScenarioName(event.target.value)}
                  placeholder={t("growth.placeholders.saveScenario")}
                />
                <Button variant="outline" size="icon" onClick={handleSaveScenario}>
                  <Save className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-xs text-muted-foreground">{t("growth.hints.saveScenario")}</span>
            </label>
          </div>

          <div className="rounded-lg border border-emerald-200/70 bg-emerald-50/50 p-4 text-sm text-emerald-900">
            <p>
              {t("growth.howItWorks", {
                startingBalance: formatCurrency(parsedStartingBalance),
                monthlyInvestment: formatCurrency(parsedMonthlyInvestment),
              })}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-muted-foreground"
              onClick={() => setShowScenarios((prev) => !prev)}
            >
              {t("growth.savedScenarios")}
              <ChevronDown className={`h-4 w-4 transition ${showScenarios ? "rotate-180" : ""}`} />
            </Button>
            {showScenarios && (
              <div className="grid gap-3 md:grid-cols-2">
                {scenarios.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("growth.noScenarios")}</p>
                ) : (
                  scenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-card p-3"
                    >
                      <button
                        type="button"
                        className="text-left"
                        onClick={() => handleLoadScenario(scenario)}
                      >
                        <p className="font-medium text-sm text-foreground">{scenario.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("growth.scenarioSummary", {
                            amount: formatCurrency(parseFloat(scenario.monthlyInvestment || "0")),
                            frequency: scenario.compoundingFrequency,
                          })}
                        </p>
                      </button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteScenario(scenario.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {parsedWithdrawalRate > 0 && budgetData && budgetData.length > 0 && (() => {
          const selected = budgetData[selectedBudgetYear] || budgetData[0];
          return (
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display font-semibold">{t("growth.budget.title")}</h3>
              <p className="text-xs text-muted-foreground">
                {t("growth.budget.subtitle", { rate: parsedWithdrawalRate })}
              </p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground">{t("growth.budget.netMonthlyLabel")}</p>
                  <p className="text-lg font-mono font-semibold text-emerald-600">
                    {formatCurrency(selected.netMonthly)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {t("growth.budget.gross", { value: formatCurrency(selected.grossMonthly) })}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground">{t("growth.budget.weeklyLabel")}</p>
                  <p className="text-lg font-mono font-semibold text-emerald-600">
                    {formatCurrency(selected.netWeekly)}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground">{t("growth.budget.dailyLabel")}</p>
                  <p className="text-lg font-mono font-semibold text-emerald-600">
                    {formatCurrency(selected.netDaily)}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground">{t("growth.budget.taxLabel")}</p>
                  <p className="text-lg font-mono font-semibold text-orange-500">
                    {formatCurrency(selected.tax)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {selected.grossAnnual > 0
                      ? `${((selected.tax / selected.grossAnnual) * 100).toFixed(1)}%`
                      : "0%"}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mb-4">
                {t("growth.budget.referenceNote", { rate: 8, years: selected.year })}
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("growth.budget.yearCol")}</TableHead>
                    <TableHead className="text-right">{t("growth.budget.netMonthlyLabel")}</TableHead>
                    <TableHead className="text-right">{t("growth.budget.weeklyLabel")}</TableHead>
                    <TableHead className="text-right">{t("growth.budget.dailyLabel")}</TableHead>
                    <TableHead className="text-right">{t("growth.budget.taxLabel")}</TableHead>
                    <TableHead className="text-right">{t("growth.budget.balanceCol")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetData.map((row, idx) => (
                    <TableRow
                      key={row.year}
                      className={`cursor-pointer transition-colors ${idx === selectedBudgetYear ? "bg-emerald-500/10 border-l-2 border-l-emerald-500" : "hover:bg-muted/40"}`}
                      onClick={() => setSelectedBudgetYear(idx)}
                    >
                      <TableCell className="font-medium">
                        {t("growth.projections.years", { years: row.year })}
                      </TableCell>
                      <TableCell className="text-right font-mono text-emerald-600">
                        {formatCurrency(row.netMonthly)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-emerald-600">
                        {formatCurrency(row.netWeekly)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-emerald-600">
                        {formatCurrency(row.netDaily)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-orange-500">
                        {formatCurrency(row.tax)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {formatCurrency(row.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          );
        })()}

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display font-semibold">{t("growth.projections.title")}</h3>
              <p className="text-xs text-muted-foreground">{t("growth.projections.subtitle")}</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">{t("growth.projections.scenario")}</TableHead>
                  {milestoneYears.map((years, index) => (
                    <TableHead key={years} className="text-right">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-muted-foreground">
                          {t("growth.projections.years", { years })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("growth.projections.age", { age: ages[index] })}
                        </p>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-muted/20">
                  <TableCell className="font-medium text-foreground">
                    {t("growth.projections.totalInvested")}
                  </TableCell>
                  {totalInvested.map((value, index) => (
                    <TableCell
                      key={`total-${milestoneYears[index]}`}
                      className="text-right font-mono text-muted-foreground"
                    >
                      {formatCurrency(value)}
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-foreground">
                    {t("growth.projections.initialBalanceGrowth")}
                  </TableCell>
                  {initialBalanceGrowth.map((value, index) => (
                    <TableCell
                      key={`initial-${milestoneYears[index]}`}
                      className="text-right font-mono text-primary"
                    >
                      {formatCurrency(value)}
                    </TableCell>
                  ))}
                </TableRow>
                {rateScenarios.map((rate, index) => (
                  <TableRow key={rate}>
                    <TableCell className="font-medium text-foreground">
                      {t("growth.projections.return", { rate })}
                    </TableCell>
                    {results[index].map((entry) => (
                      <TableCell key={`${rate}-${entry.years}`} className="text-right">
                        <div className="space-y-1">
                          <p className="font-mono text-emerald-600">
                            {formatCurrency(entry.nominal)}
                          </p>
                          {entry.totalWithdrawn > 0 && (
                            <p className="text-xs font-mono text-orange-500">
                              {t("growth.projections.withdrawn", {
                                value: formatCurrency(entry.totalWithdrawn),
                              })}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {t("growth.projections.earnings", {
                              value: formatCurrency(
                                entry.nominal + entry.totalWithdrawn - entry.totalInvested,
                              ),
                            })}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {t("growth.projections.real", { value: formatCurrency(entry.real) })}
                          </p>
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="font-display font-semibold">{t("growth.definitions.title")}</h3>
          <div className="mt-3 grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">{t("growth.definitions.totalInvested.title")}</p>
              <p>{t("growth.definitions.totalInvested.body")}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">
                {t("growth.definitions.initialBalanceGrowth.title")}
              </p>
              <p>{t("growth.definitions.initialBalanceGrowth.body")}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{t("growth.definitions.nominal.title")}</p>
              <p>{t("growth.definitions.nominal.body")}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{t("growth.definitions.real.title")}</p>
              <p>{t("growth.definitions.real.body")}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{t("growth.definitions.earnings.title")}</p>
              <p>{t("growth.definitions.earnings.body")}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{t("growth.definitions.age.title")}</p>
              <p>{t("growth.definitions.age.body")}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{t("growth.definitions.withdrawalRate.title")}</p>
              <p>{t("growth.definitions.withdrawalRate.body")}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
