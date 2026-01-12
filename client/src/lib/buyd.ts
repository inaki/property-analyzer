export type BorrowMode = "fixed" | "maxSafe";

export type BuydInputs = {
  initialAssetValue: number;
  growthRatePercent: number;
  incomeYieldPercent: number;
  incomeGrowthRatePercent: number;
  annualExpenses: number;
  expenseGrowthRatePercent: number;
  initialDebt: number;
  interestRatePercent: number;
  targetLtvPercent: number;
  lenderMaxLtvPercent: number;
  borrowMode: BorrowMode;
  yearlySpend: number;
  livingExpensesPerYear: number;
  cashBufferMonths: number;
  years: number;
  stressCrashEnabled: boolean;
  stressCrashYear: number;
  stressCrashDropPercent: number;
  stressRateSpikeEnabled: boolean;
  stressRateSpikeStartYear: number;
  stressRateSpikeIncreasePercent: number;
  stressIncomeShockEnabled: boolean;
  stressIncomeShockYear: number;
  stressIncomeShockPercent: number;
  stressExpenseShockEnabled: boolean;
  stressExpenseShockYear: number;
  stressExpenseShockPercent: number;
};

export type BuydYear = {
  year: number;
  assetValue: number;
  debtBalance: number;
  ltv: number;
  cashFlow: number;
  borrowCapacity: number;
  borrowedThisYear: number;
  dscr: number;
  cashBuffer: number;
  bufferMonths: number;
  ruleBreaches: string[];
  events: string[];
};

export type BuydResult = {
  years: BuydYear[];
  currentNetWorth: number;
  currentLtv: number;
  currentCashFlow: number;
  currentBorrowCapacity: number;
  currentDscr: number;
  currentCashBuffer: number;
  currentBufferMonths: number;
  breakYear: number | null;
};

export function simulateBuyd(inputs: BuydInputs): BuydResult {
  const years = Math.max(1, Math.round(inputs.years || 1));
  const growthRate = (inputs.growthRatePercent || 0) / 100;
  const incomeYield = (inputs.incomeYieldPercent || 0) / 100;
  const incomeGrowthRate = (inputs.incomeGrowthRatePercent || 0) / 100;
  const baseInterestRate = (inputs.interestRatePercent || 0) / 100;
  const targetLtv = (inputs.targetLtvPercent || 0) / 100;
  const lenderMaxLtv = (inputs.lenderMaxLtvPercent || 0) / 100;
  const expenseGrowthRate = (inputs.expenseGrowthRatePercent || 0) / 100;

  const series: BuydYear[] = [];
  let assetValue = Math.max(0, inputs.initialAssetValue || 0);
  let debtBalance = Math.max(0, inputs.initialDebt || 0);
  let incomeYieldBase = incomeYield;
  let annualExpenses = Math.max(0, inputs.annualExpenses || 0);
  let livingExpenses = Math.max(0, inputs.livingExpensesPerYear || 0);
  let cashBuffer = (livingExpenses / 12) * Math.max(0, inputs.cashBufferMonths || 0);
  let breakYear: number | null = null;

  for (let year = 1; year <= years; year += 1) {
    const ruleBreaches: string[] = [];
    const events: string[] = [];

    assetValue = assetValue * (1 + growthRate);
    if (inputs.stressCrashEnabled && year === inputs.stressCrashYear) {
      const drop = Math.min(100, Math.max(0, inputs.stressCrashDropPercent || 0)) / 100;
      assetValue = assetValue * (1 - drop);
      events.push(`Asset shock: -${Math.round(drop * 100)}% value drop.`);
    }
    incomeYieldBase = incomeYieldBase * (1 + incomeGrowthRate);
    annualExpenses = annualExpenses * (1 + expenseGrowthRate);
    livingExpenses = livingExpenses * (1 + expenseGrowthRate);

    let effectiveIncomeYield = incomeYieldBase;
    if (inputs.stressIncomeShockEnabled && year === inputs.stressIncomeShockYear) {
      const cut = Math.min(100, Math.max(0, inputs.stressIncomeShockPercent || 0)) / 100;
      effectiveIncomeYield = incomeYieldBase * (1 - cut);
      events.push(`Income shock: -${Math.round(cut * 100)}% yield.`);
    }

    let effectiveExpenses = annualExpenses;
    if (inputs.stressExpenseShockEnabled && year === inputs.stressExpenseShockYear) {
      const bump = Math.min(100, Math.max(0, inputs.stressExpenseShockPercent || 0)) / 100;
      effectiveExpenses = annualExpenses * (1 + bump);
      events.push(`Expense shock: +${Math.round(bump * 100)}% expenses.`);
    }

    let effectiveInterestRate = baseInterestRate;
    if (inputs.stressRateSpikeEnabled && year >= inputs.stressRateSpikeStartYear) {
      const increase = Math.max(0, inputs.stressRateSpikeIncreasePercent || 0) / 100;
      const yearsSinceStart = year - inputs.stressRateSpikeStartYear + 1;
      const ramp = Math.min(2, yearsSinceStart) / 2;
      effectiveInterestRate = baseInterestRate + (increase * ramp);
      if (year === inputs.stressRateSpikeStartYear) {
        events.push(`Rate spike begins: +${inputs.stressRateSpikeIncreasePercent}% over 2 years.`);
      }
    }

    const income = assetValue * effectiveIncomeYield;
    const interest = debtBalance * effectiveInterestRate;
    const cashFlow = income - effectiveExpenses - interest;
    const maxBorrow = Math.max(0, (targetLtv * assetValue) - debtBalance);
    const lenderCap = Math.max(0, (lenderMaxLtv * assetValue) - debtBalance);
    const allowedBorrow = Math.min(maxBorrow, lenderCap);
    const borrow =
      inputs.borrowMode === "maxSafe"
        ? allowedBorrow
        : Math.min(allowedBorrow, Math.max(0, inputs.yearlySpend || 0));

    if (borrow > 0) {
      events.push(`Borrowed ${Math.round(borrow)} to fund spending.`);
    }

    debtBalance += borrow;
    const ltv = assetValue > 0 ? debtBalance / assetValue : 0;
    const debtService = interest;
    const dscr = debtService > 0 ? income / debtService : 0;

    const netAfterSpending = cashFlow - livingExpenses;
    cashBuffer += netAfterSpending;
    const bufferMonths = livingExpenses > 0 ? cashBuffer / (livingExpenses / 12) : 0;

    if (ltv > lenderMaxLtv) {
      ruleBreaches.push("LTV above lender max");
    }
    if (dscr < 1) {
      ruleBreaches.push("DSCR below 1.0");
    }
    if (cashBuffer < 0) {
      ruleBreaches.push("Cash buffer depleted");
    }

    if (ruleBreaches.length > 0 && breakYear === null) {
      breakYear = year;
    }

    series.push({
      year,
      assetValue,
      debtBalance,
      ltv,
      cashFlow,
      borrowCapacity: allowedBorrow,
      borrowedThisYear: borrow,
      dscr,
      cashBuffer,
      bufferMonths,
      ruleBreaches,
      events,
    });
  }

  const currentNetWorth = assetValue - debtBalance;
  const currentLtv = assetValue > 0 ? debtBalance / assetValue : 0;
  const currentBorrowCapacity = series.length > 0 ? series[series.length - 1].borrowCapacity : 0;
  const currentCashFlow = series.length > 0 ? series[series.length - 1].cashFlow : 0;
  const currentDscr = series.length > 0 ? series[series.length - 1].dscr : 0;
  const currentCashBuffer = series.length > 0 ? series[series.length - 1].cashBuffer : 0;
  const currentBufferMonths = series.length > 0 ? series[series.length - 1].bufferMonths : 0;

  return {
    years: series,
    currentNetWorth,
    currentLtv,
    currentCashFlow,
    currentBorrowCapacity,
    currentDscr,
    currentCashBuffer,
    currentBufferMonths,
    breakYear,
  };
}
