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

export default function CompoundInterest() {
  const { t } = useTranslation();
  const [monthlyInvestment, setMonthlyInvestment] = useState("500");
  const [startingBalance, setStartingBalance] = useState("5000");
  const [currentAge, setCurrentAge] = useState("30");
  const [inflationRate, setInflationRate] = useState("2.5");
  const [compoundingFrequency, setCompoundingFrequency] = useState("12");
  const [scenarioName, setScenarioName] = useState("");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [showScenarios, setShowScenarios] = useState(false);

  const parsedMonthlyInvestment = parseFloat(monthlyInvestment) || 0;
  const parsedStartingBalance = parseFloat(startingBalance) || 0;
  const parsedAge = parseInt(currentAge, 10) || 0;
  const parsedInflationRate = parseFloat(inflationRate) || 0;
  const parsedFrequency = parseInt(compoundingFrequency, 10) || 12;

  const results = useMemo(() => {
    return rateScenarios.map((rate) => {
      const annualRate = rate / 100;
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
        };
      });
    });
  }, [
    parsedStartingBalance,
    parsedMonthlyInvestment,
    parsedInflationRate,
    parsedFrequency,
  ]);

  const ages = milestoneYears.map((years) => parsedAge + years);

  const totalInvested = milestoneYears.map(
    (years) => parsedMonthlyInvestment * 12 * years,
  );

  const initialBalanceGrowth = milestoneYears.map((years) =>
    calculateCompoundInterest(parsedStartingBalance, 0.08, parsedFrequency, years),
  );

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
                {totalInvested.map((value) => (
                  <TableCell key={value} className="text-right font-mono text-muted-foreground">
                    {formatCurrency(value)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-foreground">
                  {t("growth.projections.initialBalanceGrowth")}
                </TableCell>
                {initialBalanceGrowth.map((value) => (
                  <TableCell key={value} className="text-right font-mono text-primary">
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
                        <p className="text-xs text-muted-foreground">
                          {t("growth.projections.earnings", {
                            value: formatCurrency(entry.nominal - entry.totalInvested),
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
          </div>
        </div>
      </div>
    </Layout>
  );
}
