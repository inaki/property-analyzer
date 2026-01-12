import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Slider } from "@/components/ui/slider";
import { MetricCard } from "@/components/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateBuydAnalysis } from "@/hooks/use-analyses";
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
      description: selectedScenario?.name ?? "BUYD snapshot",
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
            <h1 className="text-3xl font-display font-bold">BUYD Calculator</h1>
            <p className="text-muted-foreground mt-1">
              Borrow-until-you-die simulator with deterministic, single-asset rules.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={results.currentLtv <= 0.4 ? "default" : "destructive"}>
              LTV {formatPercent(results.currentLtv)}
            </Badge>
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-9">
                  <Save className="mr-2 h-4 w-4" />
                  Save Analysis
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save BUYD Snapshot</DialogTitle>
                  <DialogDescription>
                    Name this BUYD scenario to keep it in your saved list.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="e.g. Standard BUYD 30-year"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={createMutation.isPending || !title.trim()}>
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Analysis"
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
                <h2 className="font-display font-semibold text-lg">Portfolio</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Single-asset MVP, interest-only debt.
                </p>
              </div>

              <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Scenario Library</p>
                    <p className="text-xs text-muted-foreground">Prebuilt BUYD cases.</p>
                  </div>
                </div>
                <Select value={scenarioId} onValueChange={loadScenario}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    {buydScenarios.map((scenario) => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedScenario && (
                  <p className="text-xs text-muted-foreground">{selectedScenario.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <label className="space-y-2 text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    Asset Value
                    <InfoTip text="Starting portfolio value for the strategy." />
                  </span>
                  <Input
                    type="number"
                    value={state.initialAssetValue}
                    onChange={handleNumberChange("initialAssetValue")}
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    Growth Rate (%)
                    <InfoTip text="Expected annual asset appreciation." />
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
                    Income Yield (%)
                    <InfoTip text="Net income yield before interest and living expenses." />
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
                    Income Growth (%)
                    <InfoTip text="Annual growth rate for income yield." />
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
                    Annual Expenses
                    <InfoTip text="Operating costs tied to the asset (taxes, upkeep, fees)." />
                  </span>
                  <Input
                    type="number"
                    value={state.annualExpenses}
                    onChange={handleNumberChange("annualExpenses")}
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    Expense Growth (%)
                    <InfoTip text="Annual increase in operating expenses." />
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
                <h3 className="font-display font-semibold text-base mb-3">Debt</h3>
                <div className="grid grid-cols-1 gap-4">
                  <label className="space-y-2 text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      Starting Debt
                      <InfoTip text="Existing borrow balance at year 0." />
                    </span>
                    <Input
                      type="number"
                      value={state.initialDebt}
                      onChange={handleNumberChange("initialDebt")}
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      Interest Rate (%)
                      <InfoTip text="Annual interest rate on outstanding debt." />
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
                      Lender Max LTV (%)
                      <InfoTip text="Hard cap that triggers forced deleveraging." />
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
                <h3 className="font-display font-semibold text-base mb-3">Strategy</h3>
                <label className="space-y-2 text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    Target LTV
                    <InfoTip text="Desired leverage target for safe borrowing." />
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
                      Borrow Mode
                      <InfoTip text="Max Safe Draw uses available headroom each year." />
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
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maxSafe">Max Safe Draw</SelectItem>
                        <SelectItem value="fixed">Fixed Draw</SelectItem>
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      Yearly Spend
                      <InfoTip text="Annual cash need funded from borrowing." />
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
                      Living Expenses / Year
                      <InfoTip text="Personal spending after debt service." />
                    </span>
                    <Input
                      type="number"
                      value={state.livingExpensesPerYear}
                      onChange={handleNumberChange("livingExpensesPerYear")}
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      Cash Buffer (months)
                      <InfoTip text="Months of personal runway to avoid forced selling." />
                    </span>
                    <Input
                      type="number"
                      value={state.cashBufferMonths}
                      onChange={handleNumberChange("cashBufferMonths")}
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="text-muted-foreground">Horizon (years)</span>
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
                <h3 className="font-display font-semibold text-base mb-3">Stress Lab</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Asset Crash</p>
                      <p className="text-xs text-muted-foreground">One-time value drop.</p>
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
                      <span className="text-muted-foreground">Crash Year</span>
                      <Input
                        type="number"
                        value={state.stressCrashYear}
                        onChange={handleNumberChange("stressCrashYear")}
                      />
                    </label>
                    <label className="space-y-2 text-xs">
                      <span className="text-muted-foreground">Drop (%)</span>
                      <Input
                        type="number"
                        value={state.stressCrashDropPercent}
                        onChange={handleNumberChange("stressCrashDropPercent")}
                      />
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div>
                      <p className="text-sm font-medium">Rate Spike</p>
                      <p className="text-xs text-muted-foreground">Increase over 2 years.</p>
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
                      <span className="text-muted-foreground">Start Year</span>
                      <Input
                        type="number"
                        value={state.stressRateSpikeStartYear}
                        onChange={handleNumberChange("stressRateSpikeStartYear")}
                      />
                    </label>
                    <label className="space-y-2 text-xs">
                      <span className="text-muted-foreground">Increase (%)</span>
                      <Input
                        type="number"
                        value={state.stressRateSpikeIncreasePercent}
                        onChange={handleNumberChange("stressRateSpikeIncreasePercent")}
                      />
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div>
                      <p className="text-sm font-medium">Income Shock</p>
                      <p className="text-xs text-muted-foreground">Yield drop for one year.</p>
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
                      <span className="text-muted-foreground">Shock Year</span>
                      <Input
                        type="number"
                        value={state.stressIncomeShockYear}
                        onChange={handleNumberChange("stressIncomeShockYear")}
                      />
                    </label>
                    <label className="space-y-2 text-xs">
                      <span className="text-muted-foreground">Drop (%)</span>
                      <Input
                        type="number"
                        value={state.stressIncomeShockPercent}
                        onChange={handleNumberChange("stressIncomeShockPercent")}
                      />
                    </label>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40">
                    <div>
                      <p className="text-sm font-medium">Expense Shock</p>
                      <p className="text-xs text-muted-foreground">Expense spike for one year.</p>
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
                      <span className="text-muted-foreground">Shock Year</span>
                      <Input
                        type="number"
                        value={state.stressExpenseShockYear}
                        onChange={handleNumberChange("stressExpenseShockYear")}
                      />
                    </label>
                    <label className="space-y-2 text-xs">
                      <span className="text-muted-foreground">Increase (%)</span>
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
                title="Net Worth"
                value={formatCurrency(results.currentNetWorth)}
                description="Assets minus debt"
              />
              <MetricCard
                title="Cash Flow"
                value={formatCurrency(results.currentCashFlow)}
                description="After interest & expenses"
                trend={results.currentCashFlow >= 0 ? "up" : "down"}
              />
              <MetricCard
                title="Borrow Capacity"
                value={formatCurrency(results.currentBorrowCapacity)}
                description="Room to target LTV"
              />
              <MetricCard
                title="DSCR"
                value={results.currentDscr.toFixed(2)}
                description="Income / interest"
                trend={results.currentDscr >= 1.25 ? "up" : "down"}
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Cash Buffer"
                value={formatCurrency(results.currentCashBuffer)}
                description="Reserves available"
                trend={results.currentCashBuffer >= 0 ? "up" : "down"}
              />
              <MetricCard
                title="Buffer Months"
                value={results.currentBufferMonths.toFixed(1)}
                description="Months of runway"
                trend={results.currentBufferMonths >= state.cashBufferMonths ? "up" : "down"}
              />
              <MetricCard
                title="Break Year"
                value={results.breakYear ? `Year ${results.breakYear}` : "Stable"}
                description="First rule breach"
                trend={results.breakYear ? "down" : "up"}
              />
              <MetricCard
                title="Lender Max LTV"
                value={`${state.lenderMaxLtvPercent}%`}
                description="Hard leverage cap"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h3 className="font-display font-semibold mb-4">Asset vs Debt</h3>
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
                <h3 className="font-display font-semibold mb-4">LTV & Cash Flow</h3>
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
                        name="LTV"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="cashFlow"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={false}
                        name="Cash Flow"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h3 className="font-display font-semibold mb-4">Borrow Capacity</h3>
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
                <h3 className="font-display font-semibold mb-4">Cash Buffer</h3>
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
                <h3 className="font-display font-semibold mb-4">Rule Status</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">LTV Safety</span>
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
                    <span className="text-muted-foreground">DSCR</span>
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
                    <span className="text-muted-foreground">Cash Buffer</span>
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
                    <span className="text-muted-foreground">Lender Max LTV</span>
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
                <h3 className="font-display font-semibold mb-4">Events (Last 8 Years)</h3>
                <div className="space-y-2 text-sm text-muted-foreground max-h-[220px] overflow-y-auto pr-1">
                  {results.years.slice(-8).map((year) => (
                    <div key={year.year} className="flex items-start gap-3">
                      <span className="text-xs font-mono text-foreground">Y{year.year}</span>
                      <div className="space-y-1">
                        {year.events.length === 0 && year.ruleBreaches.length === 0 && (
                          <p>No major events.</p>
                        )}
                        {year.events.map((event, idx) => (
                          <p key={`${year.year}-event-${idx}`}>{event}</p>
                        ))}
                        {year.ruleBreaches.map((rule, idx) => (
                          <p key={`${year.year}-rule-${idx}`} className="text-rose-600">
                            {rule}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <h3 className="font-display font-semibold mb-2">Education Notes</h3>
              <p className="text-sm text-muted-foreground">
                This is an educational simulator. It assumes interest-only debt and
                deterministic growth. Add stress testing, taxes, and scenario analysis
                in the next phase.
              </p>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <h2 className="text-xl font-display font-semibold">BUYD Glossary</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Key terms used in the BUYD calculator.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {[
                  {
                    term: "LTV",
                    definition:
                      "Loan-to-Value. Debt balance divided by asset value.",
                  },
                  {
                    term: "DSCR",
                    definition:
                      "Debt Service Coverage Ratio. Income divided by interest cost.",
                  },
                  {
                    term: "Borrow Capacity",
                    definition:
                      "Maximum borrowing allowed this year under target and lender LTV.",
                  },
                  {
                    term: "Cash Buffer",
                    definition:
                      "Reserve cash used to cover living expenses during downturns.",
                  },
                  {
                    term: "Target LTV",
                    definition:
                      "Desired leverage level used to cap new borrowing.",
                  },
                  {
                    term: "Stress Events",
                    definition:
                      "Shocks to asset value, income, interest rates, or expenses.",
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
