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
import { MetricCard } from "@/components/MetricCard";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  ReferenceDot,
} from "recharts";
import { useTranslation } from "react-i18next";
import { Lock, Plus, Trash2 } from "lucide-react";
import {
  getPriorityOrder,
  simulateDebtPayoff,
  type DebtInput,
  type DebtStrategy,
} from "@/lib/debt";

const defaultDebts: DebtInput[] = [
  { id: "1", name: "Credit Card", balance: 6200, apr: 22.9, minPayment: 150 },
  { id: "2", name: "Car Loan", balance: 13500, apr: 6.2, minPayment: 320 },
  { id: "3", name: "Student Loan", balance: 18500, apr: 4.3, minPayment: 210 },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Debt() {
  const { t } = useTranslation();
  const [debts, setDebts] = useState<DebtInput[]>(defaultDebts);
  const [extraPayment, setExtraPayment] = useState("250");
  const [strategy, setStrategy] = useState<DebtStrategy>("avalanche");
  const [hybridThreshold, setHybridThreshold] = useState("10");
  const [chartMode, setChartMode] = useState<"total" | "stacked">("total");

  const parsedExtra = parseFloat(extraPayment) || 0;
  const parsedThreshold = parseFloat(hybridThreshold) || 0;

  const simulation = useMemo(
    () =>
      simulateDebtPayoff({
        debts,
        extraPayment: parsedExtra,
        strategy,
        hybridThreshold: parsedThreshold,
      }),
    [debts, parsedExtra, parsedThreshold, strategy],
  );

  const priorityList = useMemo(() => {
    return getPriorityOrder({
      debts,
      strategy,
      hybridThreshold: parsedThreshold,
    });
  }, [debts, parsedThreshold, strategy]);

  const priorityOrder = useMemo(() => {
    return new Map(priorityList.map((debt, index) => [debt.id, index + 1]));
  }, [priorityList]);

  const comparison = useMemo(() => {
    return [
      {
        strategy: "avalanche" as const,
        label: t("debt.strategies.avalanche"),
        result: simulateDebtPayoff({
          debts,
          extraPayment: parsedExtra,
          strategy: "avalanche",
          hybridThreshold: parsedThreshold,
        }),
      },
      {
        strategy: "snowball" as const,
        label: t("debt.strategies.snowball"),
        result: simulateDebtPayoff({
          debts,
          extraPayment: parsedExtra,
          strategy: "snowball",
          hybridThreshold: parsedThreshold,
        }),
      },
      {
        strategy: "hybrid" as const,
        label: t("debt.strategies.hybrid"),
        result: simulateDebtPayoff({
          debts,
          extraPayment: parsedExtra,
          strategy: "hybrid",
          hybridThreshold: parsedThreshold,
        }),
      },
    ];
  }, [debts, parsedExtra, parsedThreshold, t]);

  const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
  const selectedComparison = comparison.find((item) => item.strategy === strategy) ?? comparison[0];
  const baselineNoExtra = useMemo(
    () =>
      simulateDebtPayoff({
        debts,
        extraPayment: 0,
        strategy,
        hybridThreshold: parsedThreshold,
      }),
    [debts, parsedThreshold, strategy],
  );

  const hybridMatchesAvalanche = useMemo(() => {
    if (strategy !== "hybrid") return false;
    const avalancheOrder = getPriorityOrder({
      debts,
      strategy: "avalanche",
      hybridThreshold: parsedThreshold,
    }).map((debt) => debt.id);
    const hybridOrder = priorityList.map((debt) => debt.id);
    if (avalancheOrder.length !== hybridOrder.length) return false;
    return avalancheOrder.every((id, index) => id === hybridOrder[index]);
  }, [debts, parsedThreshold, priorityList, strategy]);

  const strategyReasons = useMemo(() => {
    return priorityList.map((debt) => {
      if (strategy === "avalanche") {
        return {
          id: debt.id,
          name: debt.name,
          reason: t("debt.strategyReasons.highestApr", { apr: debt.apr.toFixed(1) }),
        };
      }
      if (strategy === "snowball") {
        return {
          id: debt.id,
          name: debt.name,
          reason: t("debt.strategyReasons.smallestBalance", {
            balance: formatCurrency(debt.balance),
          }),
        };
      }
      if (debt.apr >= parsedThreshold) {
        return {
          id: debt.id,
          name: debt.name,
          reason: t("debt.strategyReasons.aboveThreshold", {
            apr: debt.apr.toFixed(1),
            threshold: parsedThreshold.toFixed(1),
          }),
        };
      }
      return {
        id: debt.id,
        name: debt.name,
        reason: t("debt.strategyReasons.belowThreshold", {
          balance: formatCurrency(debt.balance),
        }),
      };
    });
  }, [parsedThreshold, priorityList, strategy, t]);

  const milestones = useMemo(() => {
    const entries: { label: string; month: number | null }[] = [];
    const payoffMonths = simulation.payoffSummaries.map((summary) => summary.monthsToPayoff);
    const firstPayoff = payoffMonths.length > 0 ? Math.min(...payoffMonths) : null;
    const halfway = simulation.schedule.find(
      (row) => row.totalBalance <= totalBalance * 0.5,
    )?.month;
    entries.push({
      label: t("debt.milestones.first"),
      month: firstPayoff ?? null,
    });
    entries.push({
      label: t("debt.milestones.halfway"),
      month: halfway ?? null,
    });
    entries.push({
      label: t("debt.milestones.debtFree"),
      month: simulation.totalMonths || null,
    });
    return entries.filter((entry) => entry.month);
  }, [simulation, t, totalBalance]);

  const milestonePoints = useMemo(() => {
    return milestones
      .map((milestone) => {
        const point = simulation.schedule.find((row) => row.month === milestone.month);
        if (!point) return null;
        return {
          ...milestone,
          value: point.totalBalance,
        };
      })
      .filter((item): item is { label: string; month: number; value: number } => Boolean(item));
  }, [milestones, simulation.schedule]);

  const bestForLabel: Record<DebtStrategy, string> = {
    avalanche: t("debt.comparison.bestFor.avalanche"),
    snowball: t("debt.comparison.bestFor.snowball"),
    hybrid: t("debt.comparison.bestFor.hybrid"),
  };

  const extraSavings = {
    interest: baselineNoExtra.totalInterestPaid - simulation.totalInterestPaid,
    months: baselineNoExtra.totalMonths - simulation.totalMonths,
  };

  const whatIfScenarios = useMemo(
    () => [
      {
        id: "rateSpike",
        title: t("debt.whatIf.rateSpike.title"),
        description: t("debt.whatIf.rateSpike.description"),
        debts: debts.map((debt) => ({ ...debt, apr: debt.apr + 3 })),
        extra: parsedExtra,
      },
      {
        id: "incomeDrop",
        title: t("debt.whatIf.incomeDrop.title"),
        description: t("debt.whatIf.incomeDrop.description"),
        debts,
        extra: Math.max(0, parsedExtra - 100),
      },
      {
        id: "pauseExtra",
        title: t("debt.whatIf.pauseExtra.title"),
        description: t("debt.whatIf.pauseExtra.description"),
        debts,
        extra: 0,
      },
    ],
    [debts, parsedExtra, t],
  );

  const whatIfResults = useMemo(() => {
    return whatIfScenarios.map((scenario) => {
      const result = simulateDebtPayoff({
        debts: scenario.debts,
        extraPayment: scenario.extra,
        strategy,
        hybridThreshold: parsedThreshold,
      });
      return {
        ...scenario,
        result,
        deltaInterest: result.totalInterestPaid - simulation.totalInterestPaid,
        deltaMonths: result.totalMonths - simulation.totalMonths,
      };
    });
  }, [parsedThreshold, simulation, strategy, whatIfScenarios]);

  const quickPresets = [50, 100, 250, 500];
  const palette = ["#6366f1", "#14b8a6", "#f97316", "#e11d48", "#0ea5e9", "#a855f7"];

  const handleReset = () => {
    setDebts(defaultDebts);
    setExtraPayment("250");
    setStrategy("avalanche");
    setHybridThreshold("10");
    setChartMode("total");
  };

  const handleDebtChange = (
    id: string,
    field: keyof DebtInput,
    value: string,
  ) => {
    setDebts((prev) =>
      prev.map((debt) => {
        if (debt.id !== id) return debt;
        if (field === "name") {
          return { ...debt, name: value };
        }
        const numericValue = parseFloat(value) || 0;
        return { ...debt, [field]: numericValue } as DebtInput;
      }),
    );
  };

  const handleAddDebt = () => {
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
    setDebts((prev) => [
      ...prev,
      { id, name: t("debt.defaultDebtName"), balance: 1000, apr: 12, minPayment: 50 },
    ]);
  };

  const handleRemoveDebt = (id: string) => {
    setDebts((prev) => prev.filter((debt) => debt.id !== id));
  };

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">{t("debt.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("debt.subtitle")}</p>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold text-lg">{t("debt.controls.title")}</h2>
              <p className="text-sm text-muted-foreground">{t("debt.controls.subtitle")}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              {t("debt.controls.reset")}
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">{t("debt.controls.strategy")}</span>
              <Select value={strategy} onValueChange={(value) => setStrategy(value as DebtStrategy)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("debt.controls.strategyPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="avalanche">{t("debt.strategies.avalanche")}</SelectItem>
                  <SelectItem value="snowball">{t("debt.strategies.snowball")}</SelectItem>
                  <SelectItem value="hybrid">{t("debt.strategies.hybrid")}</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">{t("debt.controls.extraPayment")}</span>
              <Input
                type="number"
                value={extraPayment}
                onChange={(event) => setExtraPayment(event.target.value)}
                placeholder="250"
              />
              <div className="flex flex-wrap gap-2">
                {quickPresets.map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    onClick={() => setExtraPayment(String(preset))}
                  >
                    +{formatCurrency(preset)}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("debt.extraImpact", {
                  interest: formatCurrency(Math.max(0, extraSavings.interest)),
                  months: Math.max(0, extraSavings.months),
                })}
              </p>
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">{t("debt.controls.hybridThreshold")}</span>
              <Input
                type="number"
                value={hybridThreshold}
                onChange={(event) => setHybridThreshold(event.target.value)}
                placeholder="10"
                disabled={strategy !== "hybrid"}
              />
            </label>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
            <p>{t(`debt.strategyNotes.${strategy}`)}</p>
          </div>

          <div className="rounded-lg border border-border/60 bg-background p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{t("debt.strategyWhy.title")}</p>
              {strategy === "hybrid" && (
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    hybridMatchesAvalanche
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {hybridMatchesAvalanche
                    ? t("debt.strategyWhy.matches")
                    : t("debt.strategyWhy.deviates")}
                </span>
              )}
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {strategyReasons.map((item, index) => (
                <div
                  key={item.id}
                  className="min-w-[220px] flex items-start justify-between gap-4 rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {index + 1}. {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg">{t("debt.debts.title")}</h2>
            <Button variant="outline" size="sm" onClick={handleAddDebt}>
              <Plus className="mr-2 h-4 w-4" />
              {t("debt.debts.add")}
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("debt.debts.columns.name")}</TableHead>
                  <TableHead>{t("debt.debts.columns.balance")}</TableHead>
                  <TableHead>{t("debt.debts.columns.apr")}</TableHead>
                  <TableHead>{t("debt.debts.columns.aprTag")}</TableHead>
                  <TableHead>{t("debt.debts.columns.minPayment")}</TableHead>
                  <TableHead>{t("debt.debts.columns.priority")}</TableHead>
                  <TableHead className="text-right">{t("debt.debts.columns.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {debts.map((debt) => (
                  <TableRow key={debt.id}>
                    <TableCell>
                      <Input
                        value={debt.name}
                        onChange={(event) => handleDebtChange(debt.id, "name", event.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={debt.balance}
                        onChange={(event) => handleDebtChange(debt.id, "balance", event.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={debt.apr}
                        onChange={(event) => handleDebtChange(debt.id, "apr", event.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex min-w-[84px] items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs ${
                          debt.apr >= 15
                            ? "bg-rose-100 text-rose-700"
                            : debt.apr >= 8
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {debt.apr >= 15
                          ? t("debt.aprLabels.high")
                          : debt.apr >= 8
                          ? t("debt.aprLabels.medium")
                          : t("debt.aprLabels.low")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="relative">
                        <Input
                          type="number"
                          value={debt.minPayment}
                          onChange={(event) => handleDebtChange(debt.id, "minPayment", event.target.value)}
                          className="bg-muted/40 pr-8"
                        />
                        <Lock className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {priorityOrder.get(debt.id) ?? "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDebt(debt.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title={t("debt.metrics.totalBalance.title")}
            value={<AnimatedNumber value={totalBalance} format={formatCurrency} />}
            description={t("debt.metrics.totalBalance.description")}
            className="transition-transform duration-300 hover:-translate-y-0.5"
          />
          <MetricCard
            title={t("debt.metrics.totalInterest.title")}
            value={<AnimatedNumber value={simulation.totalInterestPaid} format={formatCurrency} />}
            description={t("debt.metrics.totalInterest.description")}
            className="transition-transform duration-300 hover:-translate-y-0.5"
          />
          <MetricCard
            title={t("debt.metrics.months.title")}
            value={<AnimatedNumber value={simulation.totalMonths} />}
            description={t("debt.metrics.months.description")}
            className="transition-transform duration-300 hover:-translate-y-0.5"
          />
          <MetricCard
            title={t("debt.metrics.extra.title")}
            value={<AnimatedNumber value={parsedExtra} format={formatCurrency} />}
            description={t("debt.metrics.extra.description")}
            className="transition-transform duration-300 hover:-translate-y-0.5"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {comparison.map((item) => (
            <div key={item.strategy} className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold">{item.label}</h3>
                {item.strategy === strategy && (
                  <span className="text-xs uppercase tracking-wide text-primary">
                    {t("debt.comparison.selected")}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{bestForLabel[item.strategy]}</p>
              <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>{t("debt.metrics.totalInterest.title")}</span>
                  <span className="font-mono text-foreground">
                    {formatCurrency(item.result.totalInterestPaid)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t("debt.metrics.months.title")}</span>
                  <span className="font-mono text-foreground">{item.result.totalMonths}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>{t("debt.comparison.delta")}</span>
                  {item.strategy === selectedComparison.strategy ? (
                    <span className="text-muted-foreground">{t("debt.comparison.baseline")}</span>
                  ) : (
                    <span className="font-medium text-foreground">
                      {formatCurrency(item.result.totalInterestPaid - selectedComparison.result.totalInterestPaid)} /{" "}
                      {item.result.totalMonths - selectedComparison.result.totalMonths} {t("debt.comparison.monthsShort")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h3 className="font-display font-semibold">{t("debt.chart.title")}</h3>
              <div className="flex items-center gap-2 text-xs">
                <Button
                  variant={chartMode === "total" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartMode("total")}
                >
                  {t("debt.chart.total")}
                </Button>
                <Button
                  variant={chartMode === "stacked" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartMode("stacked")}
                >
                  {t("debt.chart.stacked")}
                </Button>
              </div>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === "total" ? (
                  <LineChart data={simulation.schedule}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(val) => `$${Math.round(val / 1000)}k`}
                    />
                    <RechartsTooltip formatter={(value: number) => formatCurrency(value as number)} />
                    {milestonePoints.map((milestone) => (
                      <ReferenceDot
                        key={milestone.label}
                        x={milestone.month}
                        y={milestone.value}
                        r={4}
                        fill="#0ea5e9"
                        stroke="none"
                        label={{
                          position: "top",
                          value: milestone.label,
                          fill: "#64748b",
                          fontSize: 10,
                        }}
                      />
                    ))}
                    <Line type="monotone" dataKey="totalBalance" stroke="#6366f1" strokeWidth={2} dot={false} />
                  </LineChart>
                ) : (
                  <AreaChart data={simulation.schedule}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(val) => `$${Math.round(val / 1000)}k`}
                    />
                    <RechartsTooltip formatter={(value: number) => formatCurrency(value as number)} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {debts.map((debt, index) => (
                      <Area
                        key={debt.id}
                        type="monotone"
                        dataKey={`balances.${debt.id}`}
                        name={debt.name}
                        stackId="1"
                        stroke={palette[index % palette.length]}
                        fill={palette[index % palette.length]}
                        fillOpacity={0.3}
                      />
                    ))}
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
            {milestones.length > 0 && (
              <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm">
                {milestones.map((milestone) => (
                  <div key={milestone.label} className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                    <p className="text-xs text-muted-foreground">{milestone.label}</p>
                    <p className="font-semibold">
                      {t("debt.milestones.monthLabel", { month: milestone.month })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h3 className="font-display font-semibold mb-4">{t("debt.summary.title")}</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("debt.summary.columns.name")}</TableHead>
                  <TableHead>{t("debt.summary.columns.months")}</TableHead>
                  <TableHead>{t("debt.summary.columns.interest")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {simulation.payoffSummaries.map((summary) => (
                  <TableRow key={summary.id}>
                    <TableCell className="font-medium">{summary.name}</TableCell>
                    <TableCell>{summary.monthsToPayoff}</TableCell>
                    <TableCell>{formatCurrency(summary.interestPaid)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold">{t("debt.whatIf.title")}</h3>
            <span className="text-xs text-muted-foreground">{t("debt.whatIf.subtitle")}</span>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {whatIfResults.map((scenario) => (
              <div key={scenario.id} className="rounded-lg border border-border/60 p-4">
                <h4 className="font-display font-semibold text-sm">{scenario.title}</h4>
                <p className="mt-2 text-xs text-muted-foreground">{scenario.description}</p>
                <div className="mt-3 grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>{t("debt.metrics.totalInterest.title")}</span>
                    <span className="font-mono">{formatCurrency(scenario.result.totalInterestPaid)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t("debt.metrics.months.title")}</span>
                    <span className="font-mono">{scenario.result.totalMonths}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("debt.whatIf.delta")}</span>
                    <span>
                      {formatCurrency(scenario.deltaInterest)} / {scenario.deltaMonths}{" "}
                      {t("debt.comparison.monthsShort")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="font-display font-semibold">{t("debt.glossary.title")}</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              {
                title: t("debt.glossary.avalanche.title"),
                body: t("debt.glossary.avalanche.body"),
              },
              {
                title: t("debt.glossary.snowball.title"),
                body: t("debt.glossary.snowball.body"),
              },
              {
                title: t("debt.glossary.hybrid.title"),
                body: t("debt.glossary.hybrid.body"),
              },
              {
                title: t("debt.glossary.opportunity.title"),
                body: t("debt.glossary.opportunity.body"),
              },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-border/60 p-4">
                <h3 className="font-display font-semibold text-sm">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
