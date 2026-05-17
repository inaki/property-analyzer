import { MetricCard } from "@/components/MetricCard";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { simulateBuyd, type BuydInputs } from "@/lib/buyd";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

interface BuydResultsPanelProps {
  state: BuydInputs;
  results: ReturnType<typeof simulateBuyd>;
}

export function BuydResultsPanel({ state, results }: BuydResultsPanelProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={t("buyd.metrics.netWorth.title")}
          value={<AnimatedNumber value={results.currentNetWorth} format={formatCurrency} />}
          description={t("buyd.metrics.netWorth.description")}
        />
        <MetricCard
          title={t("buyd.metrics.cashFlow.title")}
          value={<AnimatedNumber value={results.currentCashFlow} format={formatCurrency} />}
          description={t("buyd.metrics.cashFlow.description")}
          trend={results.currentCashFlow >= 0 ? "up" : "down"}
        />
        <MetricCard
          title={t("buyd.metrics.borrowCapacity.title")}
          value={<AnimatedNumber value={results.currentBorrowCapacity} format={formatCurrency} />}
          description={t("buyd.metrics.borrowCapacity.description")}
        />
        <MetricCard
          title={t("buyd.metrics.dscr.title")}
          value={<AnimatedNumber value={results.currentDscr} format={(val) => val.toFixed(2)} />}
          description={t("buyd.metrics.dscr.description")}
          trend={results.currentDscr >= 1.25 ? "up" : "down"}
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={t("buyd.metrics.cashBuffer.title")}
          value={<AnimatedNumber value={results.currentCashBuffer} format={formatCurrency} />}
          description={t("buyd.metrics.cashBuffer.description")}
          trend={results.currentCashBuffer >= 0 ? "up" : "down"}
        />
        <MetricCard
          title={t("buyd.metrics.bufferMonths.title")}
          value={<AnimatedNumber value={results.currentBufferMonths} format={(val) => val.toFixed(1)} />}
          description={t("buyd.metrics.bufferMonths.description")}
          trend={results.currentBufferMonths >= state.cashBufferMonths ? "up" : "down"}
        />
        <MetricCard
          title={t("buyd.metrics.breakYear.title")}
          value={
            results.breakYear
              ? t("buyd.metrics.breakYear.value", { year: results.breakYear })
              : t("buyd.metrics.breakYear.stable")
          }
          description={t("buyd.metrics.breakYear.description")}
          trend={results.breakYear ? "down" : "up"}
        />
        <MetricCard
          title={t("buyd.metrics.lenderMaxLtv.title")}
          value={<AnimatedNumber value={state.lenderMaxLtvPercent} format={(val) => `${val}%`} />}
          description={t("buyd.metrics.lenderMaxLtv.description")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 className="font-display font-semibold mb-4">{t("buyd.charts.assetVsDebt")}</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={results.years}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `$${Math.round(val / 1000)}k`}
                  tickLine={false}
                  axisLine={false}
                />
                <RechartsTooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: "8px", border: "none" }}
                />
                <Legend />
                <Line type="monotone" dataKey="assetValue" stroke="#6366f1" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="debtBalance" stroke="#e11d48" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 className="font-display font-semibold mb-4">{t("buyd.charts.ltvCashFlow")}</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={results.years}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => formatPercent(val)}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `$${Math.round(val / 1000)}k`}
                  tickLine={false}
                  axisLine={false}
                />
                <RechartsTooltip
                  formatter={(value: number, name: string) =>
                    name === "ltv" ? formatPercent(value) : formatCurrency(value)
                  }
                  contentStyle={{ borderRadius: "8px", border: "none" }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="ltv"
                  stroke="#0f766e"
                  strokeWidth={2}
                  dot={false}
                  name={t("buyd.charts.ltv")}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cashFlow"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  name={t("buyd.charts.cashFlow")}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 className="font-display font-semibold mb-4">{t("buyd.charts.borrowCapacity")}</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={results.years}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `$${Math.round(val / 1000)}k`}
                  tickLine={false}
                  axisLine={false}
                />
                <RechartsTooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: "8px", border: "none" }}
                />
                <Line type="monotone" dataKey="borrowCapacity" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 className="font-display font-semibold mb-4">{t("buyd.charts.cashBuffer")}</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={results.years}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `$${Math.round(val / 1000)}k`}
                  tickLine={false}
                  axisLine={false}
                />
                <RechartsTooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: "8px", border: "none" }}
                />
                <Line type="monotone" dataKey="cashBuffer" stroke="#7c3aed" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 className="font-display font-semibold mb-4">{t("buyd.rules.title")}</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("buyd.rules.ltvSafety")}</span>
              <Badge
                variant={
                  results.currentLtv <= 0.4
                    ? "default"
                    : results.currentLtv <= 0.55
                      ? "secondary"
                      : "destructive"
                }
              >
                {formatPercent(results.currentLtv)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("buyd.rules.dscr")}</span>
              <Badge
                variant={
                  results.currentDscr >= 1.25
                    ? "default"
                    : results.currentDscr >= 1
                      ? "secondary"
                      : "destructive"
                }
              >
                {results.currentDscr.toFixed(2)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("buyd.rules.cashBuffer")}</span>
              <Badge
                variant={
                  results.currentBufferMonths >= state.cashBufferMonths
                    ? "default"
                    : results.currentBufferMonths > 0
                      ? "secondary"
                      : "destructive"
                }
              >
                {results.currentBufferMonths.toFixed(1)} months
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("buyd.rules.lenderMaxLtv")}</span>
              <Badge
                variant={
                  results.currentLtv <= state.lenderMaxLtvPercent / 100
                    ? "default"
                    : "destructive"
                }
              >
                {state.lenderMaxLtvPercent}%
              </Badge>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h3 className="font-display font-semibold mb-4">{t("buyd.events.title")}</h3>
          <div className="space-y-2 text-sm text-muted-foreground max-h-[220px] overflow-y-auto pr-1">
            {results.years.slice(-8).map((year) => (
              <div key={year.year} className="flex items-start gap-3">
                <span className="text-xs font-mono text-foreground">{t("buyd.events.year", { year: year.year })}</span>
                <div className="space-y-1">
                  {year.events.length === 0 && year.ruleBreaches.length === 0 && (
                    <p>{t("buyd.events.none")}</p>
                  )}
                  {year.events.map((event, idx) => {
                    const key = `${year.year}-event-${idx}`;
                    if (event.type === "borrowed") {
                      return (
                        <p key={key}>
                          {t("buyd.events.borrowed", { amount: formatCurrency(event.amount) })}
                        </p>
                      );
                    }
                    if (event.type === "assetCrash") {
                      return (
                        <p key={key}>
                          {t("buyd.events.assetCrash", { percent: event.percent })}
                        </p>
                      );
                    }
                    if (event.type === "rateSpike") {
                      return (
                        <p key={key}>
                          {t("buyd.events.rateSpike", { percent: event.percent })}
                        </p>
                      );
                    }
                    if (event.type === "incomeShock") {
                      return (
                        <p key={key}>
                          {t("buyd.events.incomeShock", { percent: event.percent })}
                        </p>
                      );
                    }
                    return (
                      <p key={key}>
                        {t("buyd.events.expenseShock", { percent: event.percent })}
                      </p>
                    );
                  })}
                  {year.ruleBreaches.map((rule, idx) => (
                    <p key={`${year.year}-rule-${idx}`} className="text-rose-600">
                      {t(`buyd.rules.breaches.${rule}`)}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <h3 className="font-display font-semibold mb-2">{t("buyd.education.title")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("buyd.education.body")}
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h2 className="text-xl font-display font-semibold">{t("buyd.glossary.title")}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t("buyd.glossary.subtitle")}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {[
            {
              term: t("buyd.glossary.ltv.title"),
              definition: t("buyd.glossary.ltv.body"),
            },
            {
              term: t("buyd.glossary.dscr.title"),
              definition: t("buyd.glossary.dscr.body"),
            },
            {
              term: t("buyd.glossary.borrowCapacity.title"),
              definition: t("buyd.glossary.borrowCapacity.body"),
            },
            {
              term: t("buyd.glossary.cashBuffer.title"),
              definition: t("buyd.glossary.cashBuffer.body"),
            },
            {
              term: t("buyd.glossary.targetLtv.title"),
              definition: t("buyd.glossary.targetLtv.body"),
            },
            {
              term: t("buyd.glossary.stressEvents.title"),
              definition: t("buyd.glossary.stressEvents.body"),
            },
          ].map((item) => (
            <div key={item.term} className="rounded-lg border border-border/60 p-4">
              <h3 className="font-display font-semibold text-sm">{item.term}</h3>
              <p className="text-sm text-muted-foreground mt-2">{item.definition}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
