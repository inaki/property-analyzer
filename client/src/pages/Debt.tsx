import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { useTranslation } from "react-i18next";
import {
  getPriorityOrder,
  simulateDebtPayoff,
  type DebtInput,
  type DebtStrategy,
} from "@/lib/debt";
import { DebtControlsPanel } from "@/components/debt/DebtControlsPanel";
import { DebtResultsPanel } from "@/components/debt/DebtResultsPanel";

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

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold">{t("debt.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("debt.subtitle")}</p>
        </div>
        <DebtControlsPanel
          debts={debts}
          setDebts={setDebts}
          extraPayment={extraPayment}
          setExtraPayment={setExtraPayment}
          strategy={strategy}
          setStrategy={setStrategy}
          hybridThreshold={hybridThreshold}
          setHybridThreshold={setHybridThreshold}
          extraSavings={extraSavings}
          strategyReasons={strategyReasons}
          hybridMatchesAvalanche={hybridMatchesAvalanche}
          priorityOrder={priorityOrder}
          quickPresets={quickPresets}
          onReset={handleReset}
        />
        <DebtResultsPanel
          simulation={simulation}
          comparison={comparison}
          strategy={strategy}
          selectedComparison={selectedComparison}
          totalBalance={totalBalance}
          bestForLabel={bestForLabel}
          milestones={milestones}
          milestonePoints={milestonePoints}
          whatIfResults={whatIfResults}
          chartMode={chartMode}
          setChartMode={setChartMode}
          debts={debts}
          palette={palette}
          parsedExtra={parsedExtra}
        />
      </div>
    </Layout>
  );
}
