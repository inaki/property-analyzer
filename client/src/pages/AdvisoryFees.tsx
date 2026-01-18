import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
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
import { MetricCard } from "@/components/MetricCard";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { BadgeDollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

export default function AdvisoryFees() {
  const { t } = useTranslation();
  const [aum, setAum] = useState("400000");
  const [feeRate, setFeeRate] = useState("1.0");
  const [billingPeriods, setBillingPeriods] = useState("4");
  const [payoutRate, setPayoutRate] = useState("40");
  const [fundExpense, setFundExpense] = useState("0.20");
  const [platformFee, setPlatformFee] = useState("0");
  const [performanceGain, setPerformanceGain] = useState("0");
  const [performanceRate, setPerformanceRate] = useState("0");
  const [tiered, setTiered] = useState(false);
  const [tier1Cap, setTier1Cap] = useState("500000");
  const [tier1Rate, setTier1Rate] = useState("1.25");
  const [tier2Cap, setTier2Cap] = useState("1000000");
  const [tier2Rate, setTier2Rate] = useState("1.00");
  const [tier3Rate, setTier3Rate] = useState("0.75");

  const parsedAum = parseFloat(aum) || 0;
  const parsedFeeRate = parseFloat(feeRate) || 0;
  const parsedPayoutRate = parseFloat(payoutRate) || 0;
  const parsedFundExpense = parseFloat(fundExpense) || 0;
  const parsedPlatformFee = parseFloat(platformFee) || 0;
  const parsedPerformanceGain = parseFloat(performanceGain) || 0;
  const parsedPerformanceRate = parseFloat(performanceRate) || 0;

  const parsedTier1Cap = parseFloat(tier1Cap) || 0;
  const parsedTier1Rate = parseFloat(tier1Rate) || 0;
  const parsedTier2Cap = parseFloat(tier2Cap) || 0;
  const parsedTier2Rate = parseFloat(tier2Rate) || 0;
  const parsedTier3Rate = parseFloat(tier3Rate) || 0;

  const annualAdvisoryFee = useMemo(() => {
    if (!tiered) {
      return parsedAum * (parsedFeeRate / 100);
    }

    const firstCap = Math.max(0, parsedTier1Cap);
    const secondCap = Math.max(firstCap, parsedTier2Cap);
    let remaining = parsedAum;
    let fee = 0;

    const firstAmount = Math.min(remaining, firstCap);
    fee += firstAmount * (parsedTier1Rate / 100);
    remaining -= firstAmount;

    const secondAmount = Math.min(remaining, Math.max(0, secondCap - firstCap));
    fee += secondAmount * (parsedTier2Rate / 100);
    remaining -= secondAmount;

    if (remaining > 0) {
      fee += remaining * (parsedTier3Rate / 100);
    }

    return fee;
  }, [
    parsedAum,
    parsedFeeRate,
    parsedTier1Cap,
    parsedTier1Rate,
    parsedTier2Cap,
    parsedTier2Rate,
    parsedTier3Rate,
    tiered,
  ]);

  const periods = parseInt(billingPeriods, 10) || 4;
  const feePerPeriod = periods > 0 ? annualAdvisoryFee / periods : 0;
  const advisorGross = annualAdvisoryFee * (parsedPayoutRate / 100);
  const fundCost = parsedAum * (parsedFundExpense / 100);
  const performanceFee =
    parsedPerformanceGain > 0 ? parsedPerformanceGain * (parsedPerformanceRate / 100) : 0;
  const allInAnnual = annualAdvisoryFee + fundCost + parsedPlatformFee + performanceFee;
  const effectiveRate = parsedAum > 0 ? (annualAdvisoryFee / parsedAum) * 100 : 0;
  const allInRate = parsedAum > 0 ? (allInAnnual / parsedAum) * 100 : 0;

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <BadgeDollarSign className="h-4 w-4" />
            {t("advisoryFees.badge")}
          </div>
          <h1 className="text-3xl font-display font-bold">{t("advisoryFees.title")}</h1>
          <p className="text-muted-foreground">{t("advisoryFees.subtitle")}</p>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold">{t("advisoryFees.sections.inputs")}</h3>
              <p className="text-sm text-muted-foreground">{t("advisoryFees.sections.inputsHint")}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setAum("400000");
                setFeeRate("1.0");
                setBillingPeriods("4");
                setPayoutRate("40");
                setFundExpense("0.20");
                setPlatformFee("0");
                setPerformanceGain("0");
                setPerformanceRate("0");
                setTiered(false);
                setTier1Cap("500000");
                setTier1Rate("1.25");
                setTier2Cap("1000000");
                setTier2Rate("1.00");
                setTier3Rate("0.75");
              }}
            >
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title={t("advisoryFees.metrics.annualFee")}
            value={<AnimatedNumber value={annualAdvisoryFee} format={formatCurrency} />}
            subValue={t("advisoryFees.metrics.effectiveRate", {
              value: formatPercent(effectiveRate),
            })}
          />
          <MetricCard
            title={t("advisoryFees.metrics.perPeriod")}
            value={<AnimatedNumber value={feePerPeriod} format={formatCurrency} />}
            subValue={t("advisoryFees.metrics.billingLabel", { periods })}
          />
          <MetricCard
            title={t("advisoryFees.metrics.advisorGross")}
            value={<AnimatedNumber value={advisorGross} format={formatCurrency} />}
          />
          <MetricCard
            title={t("advisoryFees.metrics.allIn")}
            value={<AnimatedNumber value={allInAnnual} format={formatCurrency} />}
            subValue={t("advisoryFees.metrics.allInRate", { value: formatPercent(allInRate) })}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-3">
            <h3 className="font-display font-semibold">{t("advisoryFees.breakdown.title")}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("advisoryFees.breakdown.advisory")}</span>
                <span className="font-mono">{formatCurrency(annualAdvisoryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("advisoryFees.breakdown.fund")}</span>
                <span className="font-mono">{formatCurrency(fundCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("advisoryFees.breakdown.platform")}</span>
                <span className="font-mono">{formatCurrency(parsedPlatformFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("advisoryFees.breakdown.performance")}</span>
                <span className="font-mono">{formatCurrency(performanceFee)}</span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-2 font-semibold">
                <span>{t("advisoryFees.breakdown.total")}</span>
                <span className="font-mono">{formatCurrency(allInAnnual)}</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-3">
            <h3 className="font-display font-semibold">{t("advisoryFees.disclosure.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("advisoryFees.disclosure.body")}
            </p>
            <div className="rounded-lg border border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground">
              {t("advisoryFees.disclosure.question")}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="font-display font-semibold">{t("advisoryFees.glossary.title")}</h3>
          <p className="text-sm text-muted-foreground">{t("advisoryFees.glossary.subtitle")}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">{t("advisoryFees.glossary.aum.title")}</p>
              <p>{t("advisoryFees.glossary.aum.body")}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{t("advisoryFees.glossary.feeRate.title")}</p>
              <p>{t("advisoryFees.glossary.feeRate.body")}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{t("advisoryFees.glossary.billing.title")}</p>
              <p>{t("advisoryFees.glossary.billing.body")}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{t("advisoryFees.glossary.payout.title")}</p>
              <p>{t("advisoryFees.glossary.payout.body")}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{t("advisoryFees.glossary.tiers.title")}</p>
              <p>{t("advisoryFees.glossary.tiers.body")}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{t("advisoryFees.glossary.fund.title")}</p>
              <p>{t("advisoryFees.glossary.fund.body")}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{t("advisoryFees.glossary.platform.title")}</p>
              <p>{t("advisoryFees.glossary.platform.body")}</p>
            </div>
            <div>
              <p className="font-medium text-foreground">{t("advisoryFees.glossary.performance.title")}</p>
              <p>{t("advisoryFees.glossary.performance.body")}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="font-display font-semibold">{t("advisoryFees.questions.title")}</h3>
          <p className="text-sm text-muted-foreground">{t("advisoryFees.questions.subtitle")}</p>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p>{t("advisoryFees.questions.items.allInFee")}</p>
            <p>{t("advisoryFees.questions.items.billingMethod")}</p>
            <p>{t("advisoryFees.questions.items.payout")}</p>
            <p>{t("advisoryFees.questions.items.fundCosts")}</p>
            <p>{t("advisoryFees.questions.items.platformFees")}</p>
            <p>{t("advisoryFees.questions.items.performanceFees")}</p>
            <p>{t("advisoryFees.questions.items.termination")}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
