import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MetricCard } from "@/components/MetricCard";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { PiggyBank } from "lucide-react";
import { useTranslation } from "react-i18next";

type SavingsMode = "percent" | "amount" | "goal";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PersonalFinance() {
  const { t } = useTranslation();
  const [netIncome, setNetIncome] = useState("5000");
  const [savingsMode, setSavingsMode] = useState<SavingsMode>("percent");
  const [savingsValue, setSavingsValue] = useState("20");
  const [goalAmount, setGoalAmount] = useState("6000");
  const [goalMonths, setGoalMonths] = useState("12");
  const [fixedExpenses, setFixedExpenses] = useState("2400");

  const parsedIncome = parseFloat(netIncome) || 0;
  const parsedSavings = parseFloat(savingsValue) || 0;
  const parsedGoalAmount = parseFloat(goalAmount) || 0;
  const parsedGoalMonths = parseFloat(goalMonths) || 0;
  const parsedFixed = parseFloat(fixedExpenses) || 0;

  const savingsAmount = useMemo(() => {
    if (savingsMode === "percent") {
      return parsedIncome * (parsedSavings / 100);
    }
    if (savingsMode === "goal") {
      return parsedGoalMonths > 0 ? parsedGoalAmount / parsedGoalMonths : 0;
    }
    return parsedSavings;
  }, [parsedGoalAmount, parsedGoalMonths, parsedIncome, parsedSavings, savingsMode]);

  const guiltFreeSpending = parsedIncome - savingsAmount - parsedFixed;
  const savingsRate = parsedIncome > 0 ? savingsAmount / parsedIncome : 0;
  const fixedRatio = parsedIncome > 0 ? parsedFixed / parsedIncome : 0;

  const warnings = [
    guiltFreeSpending < 0
      ? t("personalFinance.warnings.overBudget")
      : null,
    savingsRate > 0 && savingsRate < 0.1
      ? t("personalFinance.warnings.lowSavings")
      : null,
    fixedRatio > 0.6
      ? t("personalFinance.warnings.highFixed")
      : null,
  ].filter(Boolean) as string[];

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <PiggyBank className="h-4 w-4" />
            {t("personalFinance.badge")}
          </div>
          <h1 className="text-3xl font-display font-bold">{t("personalFinance.title")}</h1>
          <p className="text-muted-foreground">{t("personalFinance.subtitle")}</p>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">{t("personalFinance.inputs.netIncome")}</span>
              <Input
                type="number"
                value={netIncome}
                onChange={(event) => setNetIncome(event.target.value)}
                placeholder={t("personalFinance.placeholders.netIncome")}
              />
              <span className="text-xs text-muted-foreground">{t("personalFinance.hints.netIncome")}</span>
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">{t("personalFinance.inputs.savingsMode")}</span>
              <Select value={savingsMode} onValueChange={(value) => setSavingsMode(value as SavingsMode)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("personalFinance.placeholders.savingsMode")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">{t("personalFinance.savingsModes.percent")}</SelectItem>
                  <SelectItem value="amount">{t("personalFinance.savingsModes.amount")}</SelectItem>
                  <SelectItem value="goal">{t("personalFinance.savingsModes.goal")}</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">{t("personalFinance.hints.savingsMode")}</span>
            </label>
            {savingsMode === "goal" ? (
              <>
                <label className="space-y-2 text-sm">
                  <span className="text-muted-foreground">
                    {t("personalFinance.inputs.goalAmount")}
                  </span>
                  <Input
                    type="number"
                    value={goalAmount}
                    onChange={(event) => setGoalAmount(event.target.value)}
                    placeholder={t("personalFinance.placeholders.goalAmount")}
                  />
                  <span className="text-xs text-muted-foreground">
                    {t("personalFinance.hints.goalAmount")}
                  </span>
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-muted-foreground">
                    {t("personalFinance.inputs.goalMonths")}
                  </span>
                  <Input
                    type="number"
                    value={goalMonths}
                    onChange={(event) => setGoalMonths(event.target.value)}
                    placeholder={t("personalFinance.placeholders.goalMonths")}
                  />
                  <span className="text-xs text-muted-foreground">
                    {t("personalFinance.hints.goalMonths")}
                  </span>
                </label>
              </>
            ) : (
              <label className="space-y-2 text-sm">
                <span className="text-muted-foreground">
                  {savingsMode === "percent"
                    ? t("personalFinance.inputs.savingsRate")
                    : t("personalFinance.inputs.savingsAmount")}
                </span>
                <Input
                  type="number"
                  value={savingsValue}
                  onChange={(event) => setSavingsValue(event.target.value)}
                  placeholder={
                    savingsMode === "percent"
                      ? t("personalFinance.placeholders.savingsRate")
                      : t("personalFinance.placeholders.savingsAmount")
                  }
                />
                <span className="text-xs text-muted-foreground">
                  {savingsMode === "percent"
                    ? t("personalFinance.hints.savingsRate")
                    : t("personalFinance.hints.savingsAmount")}
                </span>
              </label>
            )}
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">{t("personalFinance.inputs.fixedExpenses")}</span>
              <Input
                type="number"
                value={fixedExpenses}
                onChange={(event) => setFixedExpenses(event.target.value)}
                placeholder={t("personalFinance.placeholders.fixedExpenses")}
              />
              <span className="text-xs text-muted-foreground">{t("personalFinance.hints.fixedExpenses")}</span>
            </label>
          </div>

          <div className="rounded-lg border border-emerald-200/70 bg-emerald-50/50 p-4 text-sm text-emerald-900">
            {t("personalFinance.summary", {
              guiltFree: formatCurrency(guiltFreeSpending),
            })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title={t("personalFinance.metrics.guiltFree")}
            value={<AnimatedNumber value={guiltFreeSpending} format={formatCurrency} />}
            trend={guiltFreeSpending >= 0 ? "up" : "down"}
            description={t("personalFinance.metrics.guiltFreeHint")}
          />
          <MetricCard
            title={t("personalFinance.metrics.savingsAmount")}
            value={<AnimatedNumber value={savingsAmount} format={formatCurrency} />}
            subValue={
              savingsMode === "goal"
                ? t("personalFinance.metrics.goalPlan", {
                    amount: formatCurrency(parsedGoalAmount),
                    months: parsedGoalMonths || 0,
                  })
                : t("personalFinance.metrics.savingsRate", {
                    value: `${Math.round(savingsRate * 100)}%`,
                  })
            }
          />
          <MetricCard
            title={t("personalFinance.metrics.fixedExpenses")}
            value={<AnimatedNumber value={parsedFixed} format={formatCurrency} />}
            subValue={t("personalFinance.metrics.fixedRatio", {
              value: `${Math.round(fixedRatio * 100)}%`,
            })}
          />
          <MetricCard
            title={t("personalFinance.metrics.netIncome")}
            value={<AnimatedNumber value={parsedIncome} format={formatCurrency} />}
          />
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-3">
          <h3 className="font-display font-semibold">{t("personalFinance.warnings.title")}</h3>
          {warnings.length === 0 ? (
            <p className="text-sm text-emerald-600">{t("personalFinance.warnings.none")}</p>
          ) : (
            <div className="space-y-2 text-sm text-rose-600">
              {warnings.map((warning) => (
                <p key={warning}>{warning}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
