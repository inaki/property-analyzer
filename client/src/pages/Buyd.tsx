import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateBuydAnalysis } from "@/hooks/use-analyses";
import { useTranslation } from "react-i18next";
import { Loader2, Save } from "lucide-react";
import { simulateBuyd, type BuydInputs } from "@/lib/buyd";
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
import { BuydInputsPanel } from "@/components/buyd/BuydInputsPanel";
import { BuydResultsPanel } from "@/components/buyd/BuydResultsPanel";

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

  const selectedScenario = buydScenarios.find((scenario) => scenario.id === scenarioId);

  const loadScenario = (id: string) => {
    const scenario = buydScenarios.find((item) => item.id === id);
    if (!scenario) return;
    setScenarioId(id);
    setState({ ...defaultState, ...scenario.inputs });
  };

  const handleSave = async () => {
    if (!title.trim()) return;

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
      data: { inputs: state, summary },
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
              {t("buyd.header.ltv", { value: `${(results.currentLtv * 100).toFixed(1)}%` })}
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
                  <DialogDescription>{t("buyd.save.description")}</DialogDescription>
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
            <BuydInputsPanel
              state={state}
              setState={setState}
              scenarioId={scenarioId}
              loadScenario={loadScenario}
            />
          </div>
          <div className="xl:col-span-8 space-y-6">
            <BuydResultsPanel state={state} results={results} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
