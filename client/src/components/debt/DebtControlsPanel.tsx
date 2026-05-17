import React from "react";
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
import { useTranslation } from "react-i18next";
import { Lock, Plus, Trash2 } from "lucide-react";
import { type DebtInput, type DebtStrategy } from "@/lib/debt";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

interface DebtControlsPanelProps {
  debts: DebtInput[];
  setDebts: React.Dispatch<React.SetStateAction<DebtInput[]>>;
  extraPayment: string;
  setExtraPayment: (v: string) => void;
  strategy: DebtStrategy;
  setStrategy: (v: DebtStrategy) => void;
  hybridThreshold: string;
  setHybridThreshold: (v: string) => void;
  extraSavings: { interest: number; months: number };
  strategyReasons: Array<{ id: string; name: string; reason: string }>;
  hybridMatchesAvalanche: boolean;
  priorityOrder: Map<string, number>;
  quickPresets: number[];
  onReset: () => void;
}

export function DebtControlsPanel({
  debts,
  setDebts,
  extraPayment,
  setExtraPayment,
  strategy,
  setStrategy,
  hybridThreshold,
  setHybridThreshold,
  extraSavings,
  strategyReasons,
  hybridMatchesAvalanche,
  priorityOrder,
  quickPresets,
  onReset,
}: DebtControlsPanelProps) {
  const { t } = useTranslation();

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
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-semibold text-lg">{t("debt.controls.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("debt.controls.subtitle")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>
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
  );
}
