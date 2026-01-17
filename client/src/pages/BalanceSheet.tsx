import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { MetricCard } from "@/components/MetricCard";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";

type AssetKey = "cash" | "investments" | "realEstate" | "otherAssets";
type LiabilityKey = "creditCards" | "loans" | "mortgage" | "otherLiabilities";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(0)}%`;
}

export default function BalanceSheet() {
  const { t } = useTranslation();
  const [assets, setAssets] = useState({
    cash: "12000",
    investments: "35000",
    realEstate: "180000",
    otherAssets: "5000",
  });
  const [liabilities, setLiabilities] = useState({
    creditCards: "2500",
    loans: "8000",
    mortgage: "150000",
    otherLiabilities: "0",
  });
  const [monthlyExpenses, setMonthlyExpenses] = useState("3500");

  const parsedMonthlyExpenses = parseFloat(monthlyExpenses) || 0;

  const assetValues = useMemo(() => {
    return {
      cash: parseFloat(assets.cash) || 0,
      investments: parseFloat(assets.investments) || 0,
      realEstate: parseFloat(assets.realEstate) || 0,
      otherAssets: parseFloat(assets.otherAssets) || 0,
    };
  }, [assets]);

  const liabilityValues = useMemo(() => {
    return {
      creditCards: parseFloat(liabilities.creditCards) || 0,
      loans: parseFloat(liabilities.loans) || 0,
      mortgage: parseFloat(liabilities.mortgage) || 0,
      otherLiabilities: parseFloat(liabilities.otherLiabilities) || 0,
    };
  }, [liabilities]);

  const totalAssets = useMemo(() => {
    return Object.values(assetValues).reduce((sum, value) => sum + value, 0);
  }, [assetValues]);

  const totalLiabilities = useMemo(() => {
    return Object.values(liabilityValues).reduce((sum, value) => sum + value, 0);
  }, [liabilityValues]);

  const netWorth = totalAssets - totalLiabilities;
  const liquidityMonths = parsedMonthlyExpenses > 0 ? assetValues.cash / parsedMonthlyExpenses : 0;
  const debtRatio = totalAssets > 0 ? totalLiabilities / totalAssets : 0;
  const monthsLabel = t("balanceSheet.units.monthsShort");

  const handleAssetChange = (key: AssetKey) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setAssets((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleLiabilityChange =
    (key: LiabilityKey) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setLiabilities((prev) => ({ ...prev, [key]: event.target.value }));
    };

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Wallet className="h-4 w-4" />
            {t("balanceSheet.badge")}
          </div>
          <h1 className="text-3xl font-display font-bold">{t("balanceSheet.title")}</h1>
          <p className="text-muted-foreground">{t("balanceSheet.subtitle")}</p>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-display font-semibold">{t("balanceSheet.sections.assets")}</h3>
              <label className="space-y-2 text-sm block">
                <span className="text-muted-foreground">{t("balanceSheet.inputs.cash")}</span>
                <Input
                  type="number"
                  value={assets.cash}
                  onChange={handleAssetChange("cash")}
                  placeholder={t("balanceSheet.placeholders.cash")}
                />
              </label>
              <label className="space-y-2 text-sm block">
                <span className="text-muted-foreground">{t("balanceSheet.inputs.investments")}</span>
                <Input
                  type="number"
                  value={assets.investments}
                  onChange={handleAssetChange("investments")}
                  placeholder={t("balanceSheet.placeholders.investments")}
                />
              </label>
              <label className="space-y-2 text-sm block">
                <span className="text-muted-foreground">{t("balanceSheet.inputs.realEstate")}</span>
                <Input
                  type="number"
                  value={assets.realEstate}
                  onChange={handleAssetChange("realEstate")}
                  placeholder={t("balanceSheet.placeholders.realEstate")}
                />
              </label>
              <label className="space-y-2 text-sm block">
                <span className="text-muted-foreground">{t("balanceSheet.inputs.otherAssets")}</span>
                <Input
                  type="number"
                  value={assets.otherAssets}
                  onChange={handleAssetChange("otherAssets")}
                  placeholder={t("balanceSheet.placeholders.otherAssets")}
                />
              </label>
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-semibold">{t("balanceSheet.sections.liabilities")}</h3>
              <label className="space-y-2 text-sm block">
                <span className="text-muted-foreground">{t("balanceSheet.inputs.creditCards")}</span>
                <Input
                  type="number"
                  value={liabilities.creditCards}
                  onChange={handleLiabilityChange("creditCards")}
                  placeholder={t("balanceSheet.placeholders.creditCards")}
                />
              </label>
              <label className="space-y-2 text-sm block">
                <span className="text-muted-foreground">{t("balanceSheet.inputs.loans")}</span>
                <Input
                  type="number"
                  value={liabilities.loans}
                  onChange={handleLiabilityChange("loans")}
                  placeholder={t("balanceSheet.placeholders.loans")}
                />
              </label>
              <label className="space-y-2 text-sm block">
                <span className="text-muted-foreground">{t("balanceSheet.inputs.mortgage")}</span>
                <Input
                  type="number"
                  value={liabilities.mortgage}
                  onChange={handleLiabilityChange("mortgage")}
                  placeholder={t("balanceSheet.placeholders.mortgage")}
                />
              </label>
              <label className="space-y-2 text-sm block">
                <span className="text-muted-foreground">{t("balanceSheet.inputs.otherLiabilities")}</span>
                <Input
                  type="number"
                  value={liabilities.otherLiabilities}
                  onChange={handleLiabilityChange("otherLiabilities")}
                  placeholder={t("balanceSheet.placeholders.otherLiabilities")}
                />
              </label>
            </div>

            <div className="space-y-4">
              <h3 className="font-display font-semibold">{t("balanceSheet.sections.expenses")}</h3>
              <label className="space-y-2 text-sm block">
                <span className="text-muted-foreground">{t("balanceSheet.inputs.monthlyExpenses")}</span>
                <Input
                  type="number"
                  value={monthlyExpenses}
                  onChange={(event) => setMonthlyExpenses(event.target.value)}
                  placeholder={t("balanceSheet.placeholders.monthlyExpenses")}
                />
              </label>
              <div className="rounded-lg border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                {t("balanceSheet.summary.subtitle")}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title={t("balanceSheet.metrics.netWorth")}
            value={<AnimatedNumber value={netWorth} format={formatCurrency} />}
            trend={netWorth >= 0 ? "up" : "down"}
          />
          <MetricCard
            title={t("balanceSheet.metrics.totalAssets")}
            value={<AnimatedNumber value={totalAssets} format={formatCurrency} />}
          />
          <MetricCard
            title={t("balanceSheet.metrics.totalLiabilities")}
            value={<AnimatedNumber value={totalLiabilities} format={formatCurrency} />}
            subValue={t("balanceSheet.metrics.debtRatio", { value: formatPercent(debtRatio) })}
          />
          <MetricCard
            title={t("balanceSheet.metrics.liquidityRunway")}
            value={
              <AnimatedNumber
                value={liquidityMonths}
                format={(value) => `${value.toFixed(1)} ${monthsLabel}`}
              />
            }
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
            <h3 className="font-display font-semibold">{t("balanceSheet.breakdown.assets")}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("balanceSheet.inputs.cash")}</span>
                <span className="font-mono">{formatCurrency(assetValues.cash)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("balanceSheet.inputs.investments")}</span>
                <span className="font-mono">{formatCurrency(assetValues.investments)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("balanceSheet.inputs.realEstate")}</span>
                <span className="font-mono">{formatCurrency(assetValues.realEstate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("balanceSheet.inputs.otherAssets")}</span>
                <span className="font-mono">{formatCurrency(assetValues.otherAssets)}</span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-2 font-semibold">
                <span>{t("balanceSheet.breakdown.total")}</span>
                <span className="font-mono">{formatCurrency(totalAssets)}</span>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
            <h3 className="font-display font-semibold">{t("balanceSheet.breakdown.liabilities")}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("balanceSheet.inputs.creditCards")}</span>
                <span className="font-mono">{formatCurrency(liabilityValues.creditCards)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("balanceSheet.inputs.loans")}</span>
                <span className="font-mono">{formatCurrency(liabilityValues.loans)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("balanceSheet.inputs.mortgage")}</span>
                <span className="font-mono">{formatCurrency(liabilityValues.mortgage)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("balanceSheet.inputs.otherLiabilities")}</span>
                <span className="font-mono">{formatCurrency(liabilityValues.otherLiabilities)}</span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-2 font-semibold">
                <span>{t("balanceSheet.breakdown.total")}</span>
                <span className="font-mono">{formatCurrency(totalLiabilities)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
