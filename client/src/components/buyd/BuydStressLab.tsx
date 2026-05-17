import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { type BuydInputs } from "@/lib/buyd";

interface BuydStressLabProps {
  state: BuydInputs;
  setState: React.Dispatch<React.SetStateAction<BuydInputs>>;
}

export function BuydStressLab({ state, setState }: BuydStressLabProps) {
  const { t } = useTranslation();

  const handleNumberChange =
    (key: keyof BuydInputs) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value === "" ? 0 : Number(event.target.value);
      setState((prev) => ({ ...prev, [key]: next }));
    };

  return (
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
  );
}
