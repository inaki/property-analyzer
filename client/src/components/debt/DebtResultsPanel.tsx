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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { simulateDebtPayoff, type DebtInput, type DebtStrategy } from "@/lib/debt";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

type SimResult = ReturnType<typeof simulateDebtPayoff>;

interface DebtResultsPanelProps {
  simulation: SimResult;
  comparison: Array<{ strategy: DebtStrategy; label: string; result: SimResult }>;
  strategy: DebtStrategy;
  selectedComparison: { strategy: DebtStrategy; label: string; result: SimResult };
  totalBalance: number;
  bestForLabel: Record<DebtStrategy, string>;
  milestones: Array<{ label: string; month: number | null }>;
  milestonePoints: Array<{ label: string; month: number; value: number }>;
  whatIfResults: Array<{ id: string; title: string; description: string; result: SimResult; deltaInterest: number; deltaMonths: number }>;
  chartMode: "total" | "stacked";
  setChartMode: (v: "total" | "stacked") => void;
  debts: DebtInput[];
  palette: string[];
  parsedExtra: number;
}

export function DebtResultsPanel({
  simulation,
  comparison,
  strategy,
  selectedComparison,
  totalBalance,
  bestForLabel,
  milestones,
  milestonePoints,
  whatIfResults,
  chartMode,
  setChartMode,
  debts,
  palette,
  parsedExtra,
}: DebtResultsPanelProps) {
  const { t } = useTranslation();

  return (
    <>
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
    </>
  );
}
