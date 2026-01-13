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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import {
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

  const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);

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
                  <TableHead>{t("debt.debts.columns.minPayment")}</TableHead>
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
                      <Input
                        type="number"
                        value={debt.minPayment}
                        onChange={(event) => handleDebtChange(debt.id, "minPayment", event.target.value)}
                      />
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
            value={formatCurrency(totalBalance)}
            description={t("debt.metrics.totalBalance.description")}
          />
          <MetricCard
            title={t("debt.metrics.totalInterest.title")}
            value={formatCurrency(simulation.totalInterestPaid)}
            description={t("debt.metrics.totalInterest.description")}
          />
          <MetricCard
            title={t("debt.metrics.months.title")}
            value={simulation.totalMonths}
            description={t("debt.metrics.months.description")}
          />
          <MetricCard
            title={t("debt.metrics.extra.title")}
            value={formatCurrency(parsedExtra)}
            description={t("debt.metrics.extra.description")}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h3 className="font-display font-semibold mb-4">{t("debt.chart.title")}</h3>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={simulation.schedule}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => `$${Math.round(val / 1000)}k`}
                  />
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="totalBalance" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
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
