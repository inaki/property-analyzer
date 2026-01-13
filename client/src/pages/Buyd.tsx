import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Slider } from "@/components/ui/slider";
import { MetricCard } from "@/components/MetricCard";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateBuydAnalysis } from "@/hooks/use-analyses";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Info } from "lucide-react";
import { Loader2, Save } from "lucide-react";
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
import { simulateBuyd, type BorrowMode, type BuydInputs } from "@/lib/buyd";
import { buydScenarios } from "@/lib/buydScenarios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const defaultState: BuydInputs = {
  initialAssetValue: 350000,
  growthRatePercent: 3,
  incomeYieldPercent: 6,
  incomeGrowthRatePercent: 2,
  annualExpenses: 12000,
  expenseGrowthRatePercent: 2,
  initialDebt: 150000,
  interestRatePercent: 6.5,
  targetLtvPercent: 35,
  lenderMaxLtvPercent: 55,
  borrowMode: "maxSafe",
  yearlySpend: 20000,
  livingExpensesPerYear: 30000,
  cashBufferMonths: 6,
  years: 30,
  stressCrashEnabled: true,
  stressCrashYear: 3,
  stressCrashDropPercent: 30,
  stressRateSpikeEnabled: true,
  stressRateSpikeStartYear: 4,
  stressRateSpikeIncreasePercent: 3,
  stressIncomeShockEnabled: false,
  stressIncomeShockYear: 2,
  stressIncomeShockPercent: 10,
  stressExpenseShockEnabled: false,
  stressExpenseShockYear: 2,
  stressExpenseShockPercent: 15,
};

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

export default function Buyd() {
  const { t } = useTranslation();
  const initialScenario = buydScenarios[0];
  const initialState = { ...defaultState, ...(initialScenario?.inputs ?? {}) };
  const [state, setState] = useState<BuydInputs>(initialState);
  const [scenarioId, setScenarioId] = useState(initialScenario?.id ?? "");
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const createMutation = useCreateBuydAnalysis();

  const results = useMemo(() => simulateBuyd(state), [state]);

  const handleNumberChange =
    (key: keyof BuydInputs) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value === "" ? 0 : Number(event.target.value);
      setState((prev) => ({ ...prev, [key]: next }));
    };

  const selectedScenario = buydScenarios.find((scenario) => scenario.id === scenarioId);

  const loadScenario = (id: string) => {
    const scenario = buydScenarios.find((item) => item.id === id);
    if (!scenario) return;
    setScenarioId(id);
    setState({ ...defaultState, ...scenario.inputs });
  };

  const InfoTip = ({ text }: { text: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center text-muted-foreground hover:text-foreground cursor-help">
          <Info className="h-3.5 w-3.5" />
        </span>
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  );

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }

    const summary = {
      netWorth: results.currentNetWorth,
      ltv: results.currentLtv,
      cashFlow: results.currentCashFlow,
      dscr: results.currentDscr,
      breakYear: results.breakYear,
    };

    await createMutation.mutateAsync({
      title: title.trim(),
      description: selectedScenario ? t(selectedScenario.nameKey) : t("buyd.save.defaultDescription"),
      data: {
        inputs: state,
        summary,
      },
    });

    setSaveDialogOpen(false);
    setTitle("");
  };

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">{t("buyd.header.title")}</h1>
            <p className="text-muted-foreground mt-1">{t("buyd.header.subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={results.currentLtv <= 0.4 ? "default" : "destructive"}>
              {t("buyd.header.ltv", { value: formatPercent(results.currentLtv) })}
            </Badge>
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9">
                  <Save className="mr-2 h-4 w-4" />
                  {t("common.saveAnalysis")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("buyd.save.title")}</DialogTitle>
                  <DialogDescription>
                    {t("buyd.save.description")}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder={t("buyd.save.placeholder")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                    {t("common.cancel")}
                  </Button>
                  <Button onClick={handleSave} disabled={createMutation.isPending || !title.trim()}>
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("common.saving")}
                      </>
                    ) : (
                      t("common.saveAnalysis")
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-4 space-y-6">
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

              <div className="pt-2 border-t border-border/60">
                <h3 className="font-display font-semibold text-base mb-3">{t("buyd.sections.stressLab")}</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{t("buyd.stress.assetCrash.title")}</p>
                      <p className="text-xs text-muted-foreground">{t("buyd.stress.assetCrash.subtitle")}</p>
                    </div>
                    <Switch
                      checked={state.stressCrashEnabled}
                      onCheckedChange={(checked) =>
                        setState((prev) => ({ ...prev, stressCrashEnabled: checked }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="space-y-2 text-xs">
                      <span className="text-muted-foreground">{t("buyd.stress.assetCrash.year")}</span>
                      <Input
                        type="number"
                        value={state.stressCrashYear}
                        onChange={handleNumberChange("stressCrashYear")}
                      />
                    </label>
                    <label className="space-y-2 text-xs">
                      <span className="text-muted-foreground">{t("buyd.stress.assetCrash.drop")}</span>
                      <Input
                        type="number"
                        value={state.stressCrashDropPercent}
                        onChange={handleNumberChange("stressCrashDropPercent")}
                      />
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div>
                      <p className="text-sm font-medium">{t("buyd.stress.rateSpike.title")}</p>
                      <p className="text-xs text-muted-foreground">{t("buyd.stress.rateSpike.subtitle")}</p>
                    </div>
                    <Switch
                      checked={state.stressRateSpikeEnabled}
                      onCheckedChange={(checked) =>
                        setState((prev) => ({ ...prev, stressRateSpikeEnabled: checked }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="space-y-2 text-xs">
                      <span className="text-muted-foreground">{t("buyd.stress.rateSpike.startYear")}</span>
                      <Input
                        type="number"
                        value={state.stressRateSpikeStartYear}
                        onChange={handleNumberChange("stressRateSpikeStartYear")}
                      />
                    </label>
                    <label className="space-y-2 text-xs">
                      <span className="text-muted-foreground">{t("buyd.stress.rateSpike.increase")}</span>
                      <Input
                        type="number"
                        value={state.stressRateSpikeIncreasePercent}
                        onChange={handleNumberChange("stressRateSpikeIncreasePercent")}
                      />
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div>
                      <p className="text-sm font-medium">{t("buyd.stress.incomeShock.title")}</p>
                      <p className="text-xs text-muted-foreground">{t("buyd.stress.incomeShock.subtitle")}</p>
                    </div>
                    <Switch
                      checked={state.stressIncomeShockEnabled}
                      onCheckedChange={(checked) =>
                        setState((prev) => ({ ...prev, stressIncomeShockEnabled: checked }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="space-y-2 text-xs">
                      <span className="text-muted-foreground">{t("buyd.stress.incomeShock.year")}</span>
                      <Input
                        type="number"
                        value={state.stressIncomeShockYear}
                        onChange={handleNumberChange("stressIncomeShockYear")}
                      />
                    </label>
                    <label className="space-y-2 text-xs">
                      <span className="text-muted-foreground">{t("buyd.stress.incomeShock.drop")}</span>
                      <Input
                        type="number"
                        value={state.stressIncomeShockPercent}
                        onChange={handleNumberChange("stressIncomeShockPercent")}
                      />
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div>
                      <p className="text-sm font-medium">{t("buyd.stress.expenseShock.title")}</p>
                      <p className="text-xs text-muted-foreground">{t("buyd.stress.expenseShock.subtitle")}</p>
                    </div>
                    <Switch
                      checked={state.stressExpenseShockEnabled}
                      onCheckedChange={(checked) =>
                        setState((prev) => ({ ...prev, stressExpenseShockEnabled: checked }))
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="space-y-2 text-xs">
                      <span className="text-muted-foreground">{t("buyd.stress.expenseShock.year")}</span>
                      <Input
                        type="number"
                        value={state.stressExpenseShockYear}
                        onChange={handleNumberChange("stressExpenseShockYear")}
                      />
                    </label>
                    <label className="space-y-2 text-xs">
                      <span className="text-muted-foreground">{t("buyd.stress.expenseShock.increase")}</span>
                      <Input
                        type="number"
                        value={state.stressExpenseShockPercent}
                        onChange={handleNumberChange("stressExpenseShockPercent")}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-8 space-y-6">
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
        </div>
      </div>
    </Layout>
  );
}
