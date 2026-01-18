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
import { Button } from "@/components/ui/button";
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
  const incomeTotal = Math.max(parsedIncome, 0);
  const savingsShare = incomeTotal > 0 ? Math.min(savingsAmount / incomeTotal, 1) : 0;
  const fixedShare = incomeTotal > 0 ? Math.min(parsedFixed / incomeTotal, 1) : 0;
  const spendShare =
    incomeTotal > 0 ? Math.max(0, Math.min(guiltFreeSpending / incomeTotal, 1)) : 0;
  const overShare = incomeTotal > 0 ? Math.max(0, -guiltFreeSpending / incomeTotal) : 0;
  const statusKey =
    guiltFreeSpending < 0
      ? "over"
      : guiltFreeSpending / Math.max(parsedIncome, 1) < 0.15
        ? "tight"
        : "ok";
  const statusLabel = t(`personalFinance.status.${statusKey}`);

  const goalMonthly =
    savingsMode === "goal" && parsedGoalMonths > 0 ? savingsAmount : 0;
  const nudge = useMemo(() => {
    if (guiltFreeSpending < 0) {
      return t("personalFinance.nudges.overBudget", {
        amount: formatCurrency(Math.abs(guiltFreeSpending)),
      });
    }
    if (savingsRate > 0 && savingsRate < 0.1) {
      const target = parsedIncome * 0.1 - savingsAmount;
      return t("personalFinance.nudges.lowSavings", {
        amount: formatCurrency(Math.max(0, target)),
      });
    }
    if (fixedRatio > 0.6 && parsedIncome > 0) {
      const target = parsedFixed - parsedIncome * 0.6;
      return t("personalFinance.nudges.highFixed", {
        amount: formatCurrency(Math.max(0, target)),
      });
    }
    return t("personalFinance.nudges.steady");
  }, [fixedRatio, guiltFreeSpending, parsedFixed, parsedIncome, savingsAmount, savingsRate, t]);

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
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold">{t("personalFinance.sections.inputs")}</h3>
              <p className="text-sm text-muted-foreground">{t("personalFinance.sections.inputsHint")}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setNetIncome("5000");
                setSavingsMode("percent");
                setSavingsValue("20");
                setGoalAmount("6000");
                setGoalMonths("12");
                setFixedExpenses("2400");
              }}
            >
              {t("personalFinance.actions.reset")}
            </Button>
          </div>
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
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t("personalFinance.breakdown.title")}</span>
              <span className="font-medium text-foreground">
                {t("personalFinance.status.label")}: {statusLabel}
              </span>
            </div>
            <div className="h-3 w-full rounded-full overflow-hidden bg-muted flex">
              <div
                className="bg-primary"
                style={{ width: `${Math.min(100, savingsShare * 100)}%` }}
              />
              <div
                className="bg-amber-400/80"
                style={{ width: `${Math.min(100, fixedShare * 100)}%` }}
              />
              <div
                className="bg-emerald-500/80"
                style={{ width: `${Math.min(100, spendShare * 100)}%` }}
              />
              {overShare > 0 && (
                <div
                  className="bg-rose-500/80"
                  style={{ width: `${Math.min(100, overShare * 100)}%` }}
                />
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span>{t("personalFinance.breakdown.savings")}</span>
                <span className="ml-auto font-mono text-foreground">{formatCurrency(savingsAmount)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400/80" />
                <span>{t("personalFinance.breakdown.fixed")}</span>
                <span className="ml-auto font-mono text-foreground">{formatCurrency(parsedFixed)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
                <span>{t("personalFinance.breakdown.guiltFree")}</span>
                <span className="ml-auto font-mono text-foreground">
                  {formatCurrency(Math.max(0, guiltFreeSpending))}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500/80" />
                <span>{t("personalFinance.breakdown.over")}</span>
                <span className="ml-auto font-mono text-foreground">
                  {formatCurrency(Math.max(0, -guiltFreeSpending))}
                </span>
              </div>
            </div>
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

        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-2">
          <h3 className="font-display font-semibold">{t("personalFinance.nudges.title")}</h3>
          <p className="text-sm text-muted-foreground">{nudge}</p>
          {savingsMode === "goal" && parsedGoalMonths > 0 && (
            <p className="text-xs text-muted-foreground">
              {t("personalFinance.nudges.goalMonthly", {
                amount: formatCurrency(goalMonthly),
              })}
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}
