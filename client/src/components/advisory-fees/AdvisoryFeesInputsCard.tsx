import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

interface AdvisoryFeesInputsCardProps {
  aum: string; setAum: (v: string) => void;
  feeRate: string; setFeeRate: (v: string) => void;
  billingPeriods: string; setBillingPeriods: (v: string) => void;
  payoutRate: string; setPayoutRate: (v: string) => void;
  fundExpense: string; setFundExpense: (v: string) => void;
  platformFee: string; setPlatformFee: (v: string) => void;
  performanceGain: string; setPerformanceGain: (v: string) => void;
  performanceRate: string; setPerformanceRate: (v: string) => void;
  tiered: boolean; setTiered: (v: boolean) => void;
  tier1Cap: string; setTier1Cap: (v: string) => void;
  tier1Rate: string; setTier1Rate: (v: string) => void;
  tier2Cap: string; setTier2Cap: (v: string) => void;
  tier2Rate: string; setTier2Rate: (v: string) => void;
  tier3Rate: string; setTier3Rate: (v: string) => void;
  feePerPeriod: number;
  annualAdvisoryFee: number;
  onReset: () => void;
}

export function AdvisoryFeesInputsCard({
  aum, setAum,
  feeRate, setFeeRate,
  billingPeriods, setBillingPeriods,
  payoutRate, setPayoutRate,
  fundExpense, setFundExpense,
  platformFee, setPlatformFee,
  performanceGain, setPerformanceGain,
  performanceRate, setPerformanceRate,
  tiered, setTiered,
  tier1Cap, setTier1Cap,
  tier1Rate, setTier1Rate,
  tier2Cap, setTier2Cap,
  tier2Rate, setTier2Rate,
  tier3Rate, setTier3Rate,
  feePerPeriod,
  annualAdvisoryFee,
  onReset,
}: AdvisoryFeesInputsCardProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold">{t("advisoryFees.sections.inputs")}</h3>
          <p className="text-sm text-muted-foreground">{t("advisoryFees.sections.inputsHint")}</p>
        </div>
        <Button variant="outline" onClick={onReset}>
          {t("advisoryFees.actions.reset")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground">{t("advisoryFees.inputs.aum")}</span>
          <Input
            type="number"
            value={aum}
            onChange={(event) => setAum(event.target.value)}
            placeholder={t("advisoryFees.placeholders.aum")}
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground">{t("advisoryFees.inputs.billing")}</span>
          <Select value={billingPeriods} onValueChange={setBillingPeriods}>
            <SelectTrigger>
              <SelectValue placeholder={t("advisoryFees.placeholders.billing")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">{t("advisoryFees.billing.monthly")}</SelectItem>
              <SelectItem value="4">{t("advisoryFees.billing.quarterly")}</SelectItem>
              <SelectItem value="1">{t("advisoryFees.billing.annual")}</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground">{t("advisoryFees.inputs.payoutRate")}</span>
          <Input
            type="number"
            value={payoutRate}
            onChange={(event) => setPayoutRate(event.target.value)}
            placeholder={t("advisoryFees.placeholders.payoutRate")}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3 text-sm">
          <div>
            <p className="font-medium text-foreground">{t("advisoryFees.inputs.tiered")}</p>
            <p className="text-xs text-muted-foreground">{t("advisoryFees.hints.tiered")}</p>
          </div>
          <Switch checked={tiered} onCheckedChange={setTiered} />
        </div>
        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground">
            {tiered ? t("advisoryFees.inputs.tier1Rate") : t("advisoryFees.inputs.feeRate")}
          </span>
          <Input
            type="number"
            value={tiered ? tier1Rate : feeRate}
            onChange={(event) => (tiered ? setTier1Rate(event.target.value) : setFeeRate(event.target.value))}
            placeholder={
              tiered
                ? t("advisoryFees.placeholders.tier1Rate")
                : t("advisoryFees.placeholders.feeRate")
            }
          />
        </label>
        {tiered ? (
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">{t("advisoryFees.inputs.tier1Cap")}</span>
            <Input
              type="number"
              value={tier1Cap}
              onChange={(event) => setTier1Cap(event.target.value)}
              placeholder={t("advisoryFees.placeholders.tier1Cap")}
            />
          </label>
        ) : (
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">{t("advisoryFees.inputs.fundExpense")}</span>
            <Input
              type="number"
              value={fundExpense}
              onChange={(event) => setFundExpense(event.target.value)}
              placeholder={t("advisoryFees.placeholders.fundExpense")}
            />
          </label>
        )}
      </div>

      {tiered && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">{t("advisoryFees.inputs.tier2Rate")}</span>
            <Input
              type="number"
              value={tier2Rate}
              onChange={(event) => setTier2Rate(event.target.value)}
              placeholder={t("advisoryFees.placeholders.tier2Rate")}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">{t("advisoryFees.inputs.tier2Cap")}</span>
            <Input
              type="number"
              value={tier2Cap}
              onChange={(event) => setTier2Cap(event.target.value)}
              placeholder={t("advisoryFees.placeholders.tier2Cap")}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">{t("advisoryFees.inputs.tier3Rate")}</span>
            <Input
              type="number"
              value={tier3Rate}
              onChange={(event) => setTier3Rate(event.target.value)}
              placeholder={t("advisoryFees.placeholders.tier3Rate")}
            />
          </label>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground">{t("advisoryFees.inputs.fundExpense")}</span>
          <Input
            type="number"
            value={fundExpense}
            onChange={(event) => setFundExpense(event.target.value)}
            placeholder={t("advisoryFees.placeholders.fundExpense")}
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground">{t("advisoryFees.inputs.platformFee")}</span>
          <Input
            type="number"
            value={platformFee}
            onChange={(event) => setPlatformFee(event.target.value)}
            placeholder={t("advisoryFees.placeholders.platformFee")}
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground">{t("advisoryFees.inputs.performanceGain")}</span>
          <Input
            type="number"
            value={performanceGain}
            onChange={(event) => setPerformanceGain(event.target.value)}
            placeholder={t("advisoryFees.placeholders.performanceGain")}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground">{t("advisoryFees.inputs.performanceRate")}</span>
          <Input
            type="number"
            value={performanceRate}
            onChange={(event) => setPerformanceRate(event.target.value)}
            placeholder={t("advisoryFees.placeholders.performanceRate")}
          />
        </label>
      </div>

      <div className="rounded-lg border border-emerald-200/70 bg-emerald-50/50 p-4 text-sm text-emerald-900">
        {t("advisoryFees.summary", {
          perPeriod: formatCurrency(feePerPeriod),
          annual: formatCurrency(annualAdvisoryFee),
        })}
      </div>
    </div>
  );
}
