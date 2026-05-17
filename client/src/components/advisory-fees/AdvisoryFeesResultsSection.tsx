import { MetricCard } from "@/components/MetricCard";
import { AnimatedNumber } from "@/components/AnimatedNumber";
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

interface AdvisoryFeesResultsSectionProps {
  annualAdvisoryFee: number;
  feePerPeriod: number;
  effectiveRate: number;
  advisorGross: number;
  allInAnnual: number;
  allInRate: number;
  fundCost: number;
  parsedPlatformFee: number;
  performanceFee: number;
  periods: number;
}

export function AdvisoryFeesResultsSection({
  annualAdvisoryFee,
  feePerPeriod,
  effectiveRate,
  advisorGross,
  allInAnnual,
  allInRate,
  fundCost,
  parsedPlatformFee,
  performanceFee,
  periods,
}: AdvisoryFeesResultsSectionProps) {
  const { t } = useTranslation();

  return (
    <>
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
    </>
  );
}
