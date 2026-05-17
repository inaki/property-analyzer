import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { buydScenarios } from "@/lib/buydScenarios";
import { type BorrowMode, type BuydInputs } from "@/lib/buyd";
import { BuydStressLab } from "@/components/buyd/BuydStressLab";

function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center text-muted-foreground hover:text-foreground cursor-help">
          <Info className="h-3.5 w-3.5" />
        </span>
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  );
}

interface BuydInputsPanelProps {
  state: BuydInputs;
  setState: React.Dispatch<React.SetStateAction<BuydInputs>>;
  scenarioId: string;
  loadScenario: (id: string) => void;
}

export function BuydInputsPanel({ state, setState, scenarioId, loadScenario }: BuydInputsPanelProps) {
  const { t } = useTranslation();

  const handleNumberChange =
    (key: keyof BuydInputs) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value === "" ? 0 : Number(event.target.value);
      setState((prev) => ({ ...prev, [key]: next }));
    };

  const selectedScenario = buydScenarios.find((scenario) => scenario.id === scenarioId);

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6 space-y-6">
      <div>
        <h2 className="font-display font-semibold text-lg">{t("buyd.sections.portfolio")}</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {t("buyd.sections.portfolioSubtitle")}
        </p>
      </div>

      <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{t("buyd.scenarios.title")}</p>
            <p className="text-xs text-muted-foreground">{t("buyd.scenarios.subtitle")}</p>
          </div>
        </div>
        <Select value={scenarioId} onValueChange={loadScenario}>
          <SelectTrigger>
            <SelectValue placeholder={t("buyd.scenarios.placeholder")} />
          </SelectTrigger>
          <SelectContent>
            {buydScenarios.map((scenario) => (
              <SelectItem key={scenario.id} value={scenario.id}>
                {t(scenario.nameKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedScenario && (
          <p className="text-xs text-muted-foreground">{t(selectedScenario.descriptionKey)}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            {t("buyd.inputs.assetValue")}
            <InfoTip text={t("buyd.tooltips.assetValue")} />
          </span>
          <Input
            type="number"
            value={state.initialAssetValue}
            onChange={handleNumberChange("initialAssetValue")}
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            {t("buyd.inputs.growthRate")}
            <InfoTip text={t("buyd.tooltips.growthRate")} />
          </span>
          <Input
            type="number"
            step="0.1"
            value={state.growthRatePercent}
            onChange={handleNumberChange("growthRatePercent")}
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            {t("buyd.inputs.incomeYield")}
            <InfoTip text={t("buyd.tooltips.incomeYield")} />
          </span>
          <Input
            type="number"
            step="0.1"
            value={state.incomeYieldPercent}
            onChange={handleNumberChange("incomeYieldPercent")}
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            {t("buyd.inputs.incomeGrowth")}
            <InfoTip text={t("buyd.tooltips.incomeGrowth")} />
          </span>
          <Input
            type="number"
            step="0.1"
            value={state.incomeGrowthRatePercent}
            onChange={handleNumberChange("incomeGrowthRatePercent")}
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            {t("buyd.inputs.annualExpenses")}
            <InfoTip text={t("buyd.tooltips.annualExpenses")} />
          </span>
          <Input
            type="number"
            value={state.annualExpenses}
            onChange={handleNumberChange("annualExpenses")}
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            {t("buyd.inputs.expenseGrowth")}
            <InfoTip text={t("buyd.tooltips.expenseGrowth")} />
          </span>
          <Input
            type="number"
            step="0.1"
            value={state.expenseGrowthRatePercent}
            onChange={handleNumberChange("expenseGrowthRatePercent")}
          />
        </label>
      </div>

      <div className="pt-2 border-t border-border/60">
        <h3 className="font-display font-semibold text-base mb-3">{t("buyd.sections.debt")}</h3>
        <div className="grid grid-cols-1 gap-4">
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              {t("buyd.inputs.initialDebt")}
              <InfoTip text={t("buyd.tooltips.initialDebt")} />
            </span>
            <Input
              type="number"
              value={state.initialDebt}
              onChange={handleNumberChange("initialDebt")}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              {t("buyd.inputs.interestRate")}
              <InfoTip text={t("buyd.tooltips.interestRate")} />
            </span>
            <Input
              type="number"
              step="0.1"
              value={state.interestRatePercent}
              onChange={handleNumberChange("interestRatePercent")}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              {t("buyd.inputs.lenderMaxLtv")}
              <InfoTip text={t("buyd.tooltips.lenderMaxLtv")} />
            </span>
            <Input
              type="number"
              step="1"
              value={state.lenderMaxLtvPercent}
              onChange={handleNumberChange("lenderMaxLtvPercent")}
            />
          </label>
        </div>
      </div>

      <div className="pt-2 border-t border-border/60">
        <h3 className="font-display font-semibold text-base mb-3">{t("buyd.sections.strategy")}</h3>
        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            {t("buyd.inputs.targetLtv")}
            <InfoTip text={t("buyd.tooltips.targetLtv")} />
          </span>
          <div className="flex items-center gap-3">
            <Slider
              min={10}
              max={60}
              step={1}
              value={[state.targetLtvPercent]}
              onValueChange={(value) =>
                setState((prev) => ({ ...prev, targetLtvPercent: value[0] }))
              }
            />
            <span className="min-w-[40px] text-right font-mono text-xs">
              {state.targetLtvPercent}%
            </span>
          </div>
        </label>
        <div className="grid grid-cols-1 gap-4 mt-4">
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              {t("buyd.inputs.borrowMode")}
              <InfoTip text={t("buyd.tooltips.borrowMode")} />
            </span>
            <Select
              value={state.borrowMode}
              onValueChange={(value) =>
                setState((prev) => ({
                  ...prev,
                  borrowMode: value as BorrowMode,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("buyd.inputs.borrowModePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="maxSafe">{t("buyd.inputs.borrowModeMaxSafe")}</SelectItem>
                <SelectItem value="fixed">{t("buyd.inputs.borrowModeFixed")}</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              {t("buyd.inputs.yearlySpend")}
              <InfoTip text={t("buyd.tooltips.yearlySpend")} />
            </span>
            <Input
              type="number"
              value={state.yearlySpend}
              onChange={handleNumberChange("yearlySpend")}
              disabled={state.borrowMode !== "fixed"}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              {t("buyd.inputs.livingExpenses")}
              <InfoTip text={t("buyd.tooltips.livingExpenses")} />
            </span>
            <Input
              type="number"
              value={state.livingExpensesPerYear}
              onChange={handleNumberChange("livingExpensesPerYear")}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              {t("buyd.inputs.cashBufferMonths")}
              <InfoTip text={t("buyd.tooltips.cashBufferMonths")} />
            </span>
            <Input
              type="number"
              value={state.cashBufferMonths}
              onChange={handleNumberChange("cashBufferMonths")}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">{t("buyd.inputs.horizon")}</span>
            <Input
              type="number"
              value={state.years}
              onChange={handleNumberChange("years")}
              min={5}
              max={60}
            />
          </label>
        </div>
      </div>

      <BuydStressLab state={state} setState={setState} />
    </div>
  );
}
