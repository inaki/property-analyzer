import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, Save, Trash2 } from "lucide-react";
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

interface CompoundInterestInputsPanelProps {
  monthlyInvestment: string;
  setMonthlyInvestment: (v: string) => void;
  startingBalance: string;
  setStartingBalance: (v: string) => void;
  currentAge: string;
  setCurrentAge: (v: string) => void;
  inflationRate: string;
  setInflationRate: (v: string) => void;
  compoundingFrequency: string;
  setCompoundingFrequency: (v: string) => void;
  withdrawalRate: string;
  setWithdrawalRate: (v: string) => void;
  parsedStartingBalance: number;
  parsedMonthlyInvestment: number;
}

export function CompoundInterestInputsPanel({
  monthlyInvestment,
  setMonthlyInvestment,
  startingBalance,
  setStartingBalance,
  currentAge,
  setCurrentAge,
  inflationRate,
  setInflationRate,
  compoundingFrequency,
  setCompoundingFrequency,
  withdrawalRate,
  setWithdrawalRate,
  parsedStartingBalance,
  parsedMonthlyInvestment,
}: CompoundInterestInputsPanelProps) {
  const { t } = useTranslation();
  const [scenarioName, setScenarioName] = useState("");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [showScenarios, setShowScenarios] = useState(false);

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
  );
}
