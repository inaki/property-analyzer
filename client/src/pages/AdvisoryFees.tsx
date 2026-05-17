import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { BadgeDollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AdvisoryFeesInputsCard } from "@/components/advisory-fees/AdvisoryFeesInputsCard";
import { AdvisoryFeesResultsSection } from "@/components/advisory-fees/AdvisoryFeesResultsSection";

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

  const handleReset = () => {
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
  };

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

        <AdvisoryFeesInputsCard
          aum={aum} setAum={setAum}
          feeRate={feeRate} setFeeRate={setFeeRate}
          billingPeriods={billingPeriods} setBillingPeriods={setBillingPeriods}
          payoutRate={payoutRate} setPayoutRate={setPayoutRate}
          fundExpense={fundExpense} setFundExpense={setFundExpense}
          platformFee={platformFee} setPlatformFee={setPlatformFee}
          performanceGain={performanceGain} setPerformanceGain={setPerformanceGain}
          performanceRate={performanceRate} setPerformanceRate={setPerformanceRate}
          tiered={tiered} setTiered={setTiered}
          tier1Cap={tier1Cap} setTier1Cap={setTier1Cap}
          tier1Rate={tier1Rate} setTier1Rate={setTier1Rate}
          tier2Cap={tier2Cap} setTier2Cap={setTier2Cap}
          tier2Rate={tier2Rate} setTier2Rate={setTier2Rate}
          tier3Rate={tier3Rate} setTier3Rate={setTier3Rate}
          feePerPeriod={feePerPeriod}
          annualAdvisoryFee={annualAdvisoryFee}
          onReset={handleReset}
        />

        <AdvisoryFeesResultsSection
          annualAdvisoryFee={annualAdvisoryFee}
          feePerPeriod={feePerPeriod}
          effectiveRate={effectiveRate}
          advisorGross={advisorGross}
          allInAnnual={allInAnnual}
          allInRate={allInRate}
          fundCost={fundCost}
          parsedPlatformFee={parsedPlatformFee}
          performanceFee={performanceFee}
          periods={periods}
        />
      </div>
    </Layout>
  );
}
