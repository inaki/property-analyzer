import { type InsertAnalysis } from "@shared/schema";

export interface CalculationResult {
  monthlyMortgage: number;
  monthlyPrincipal: number;
  monthlyInterest: number;
  totalMonthlyExpenses: number;
  monthlyNOI: number;
  monthlyCashFlow: number;
  ownerEarningsMonthly: number;
  ownerEarningsAnnual: number;
  earningsYield: number;
  intrinsicValue: number;
  marginOfSafety: number;
  stressTestCashFlow: number;
  stressTestPass: boolean;
  capRate: number;
  cashOnCash: number;
  investmentScore: number;
  investmentGrade: string;
  totalInitialCash: number;
  yearlyAmortization: AmortizationYear[];
  cumulativeProfit: ProfitYear[];
}

export interface AmortizationYear {
  year: number;
  balance: number;
  interestPaid: number;
  principalPaid: number;
  totalPaid: number;
}

export interface ProfitYear {
  year: number;
  cumulativeCashFlow: number;
  equity: number;
  totalValue: number;
}

function calculateMonthlyMortgage(
  loanAmount: number,
  annualRate: number,
  loanTermYears: number,
): number {
  const monthlyRate = (annualRate / 100) / 12;
  const numberOfPayments = loanTermYears * 12;

  if (monthlyRate > 0 && numberOfPayments > 0) {
    return loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  if (numberOfPayments > 0) {
    return loanAmount / numberOfPayments;
  }

  return 0;
}

export function calculateMetrics(data: InsertAnalysis): CalculationResult {
  // 1. Parsing and Defaults
  const purchasePrice = Number(data.purchasePrice) || 0;
  const renovation = Number(data.renovationCost) || 0;
  const closingCosts = Number(data.closingCosts) || 0;
  const downPaymentPercent = Number(data.downPaymentPercent) || 0;
  const interestRate = Number(data.interestRate) || 0;
  const loanTermYears = Number(data.loanTermYears) || 30;
  
  const monthlyRent = Number(data.monthlyRent) || 0;
  const otherIncome = Number(data.otherMonthlyIncome) || 0;
  const vacancyRate = Number(data.vacancyRatePercent) || 0;
  
  // Expenses
  const propTaxYearly = Number(data.propertyTaxYearly) || 0;
  const insuranceYearly = Number(data.insuranceYearly) || 0;
  const hoaMonthly = Number(data.hoaMonthly) || 0;
  const utilitiesMonthly = Number(data.utilitiesMonthly) || 0;
  const otherExpensesMonthly = Number(data.otherMonthlyExpenses) || 0;
  
  const managementPercent = Number(data.managementFeePercent) || 0;
  const maintenancePercent = Number(data.maintenancePercent) || 0;

  // 2. Initial Investment
  const downPaymentAmount = purchasePrice * (downPaymentPercent / 100);
  const loanAmount = purchasePrice - downPaymentAmount;
  const totalInitialCash = downPaymentAmount + closingCosts + renovation;

  // 3. Mortgage Calculation (Monthly)
  const numberOfPayments = loanTermYears * 12;
  const monthlyRate = (interestRate / 100) / 12;
  const monthlyMortgage = calculateMonthlyMortgage(loanAmount, interestRate, loanTermYears);

  // 4. Operating Expenses
  const grossMonthlyIncome = monthlyRent + otherIncome;
  const effectiveGrossIncome = (monthlyRent + otherIncome) * (1 - (vacancyRate / 100));
  
  const managementCost = (monthlyRent + otherIncome) * (managementPercent / 100);
  const maintenanceCost = (monthlyRent + otherIncome) * (maintenancePercent / 100);
  
  const totalMonthlyExpenses = 
    (propTaxYearly / 12) +
    (insuranceYearly / 12) +
    hoaMonthly +
    utilitiesMonthly +
    otherExpensesMonthly +
    managementCost +
    maintenanceCost;

  // 5. Profitability Metrics
  const monthlyNOI = effectiveGrossIncome - totalMonthlyExpenses;
  const monthlyCashFlow = monthlyNOI - monthlyMortgage;
  
  const annualNOI = monthlyNOI * 12;
  const annualCashFlow = monthlyCashFlow * 12;
  
  const capRate = purchasePrice > 0 ? (annualNOI / purchasePrice) * 100 : 0;
  const cashOnCash = totalInitialCash > 0 ? (annualCashFlow / totalInitialCash) * 100 : 0;

  // 5. Berkshire-Style Metrics (Conservative Defaults)
  const capexReservePercent = 5;
  const requiredReturn = 0.1;
  const holdingPeriodYears = 10;
  const terminalCapRate = 0.08;

  const capexReserveMonthly = grossMonthlyIncome * (capexReservePercent / 100);
  const ownerEarningsMonthly = monthlyNOI - capexReserveMonthly;
  const ownerEarningsAnnual = ownerEarningsMonthly * 12;

  const earningsYield = purchasePrice > 0
    ? (ownerEarningsAnnual / purchasePrice) * 100
    : 0;

  let intrinsicValue = 0;
  if (ownerEarningsAnnual > 0) {
    let dcfValue = 0;
    for (let year = 1; year <= holdingPeriodYears; year += 1) {
      dcfValue += ownerEarningsAnnual / Math.pow(1 + requiredReturn, year);
    }

    const terminalValue = ownerEarningsAnnual / terminalCapRate;
    intrinsicValue = dcfValue + (terminalValue / Math.pow(1 + requiredReturn, holdingPeriodYears));
  }

  const marginOfSafety = intrinsicValue > 0
    ? ((intrinsicValue - purchasePrice) / intrinsicValue) * 100
    : 0;

  // 6. Stress Test
  const stressRent = monthlyRent * 0.8;
  const stressOtherIncome = otherIncome * 0.8;
  const stressVacancyRate = Math.min(100, vacancyRate + 10);
  const stressGrossIncome = (stressRent + stressOtherIncome) * (1 - (stressVacancyRate / 100));
  const stressManagement = (stressRent + stressOtherIncome) * (managementPercent / 100);
  const stressMaintenance = (stressRent + stressOtherIncome) * (maintenancePercent / 100);
  const fixedMonthlyExpenses =
    (propTaxYearly / 12) +
    (insuranceYearly / 12) +
    hoaMonthly +
    utilitiesMonthly +
    otherExpensesMonthly;
  const stressMonthlyExpenses = (fixedMonthlyExpenses + stressManagement + stressMaintenance) * 1.15;
  const stressInterestRate = interestRate + 2;
  const stressMonthlyMortgage = calculateMonthlyMortgage(loanAmount, stressInterestRate, loanTermYears);
  const stressMonthlyNOI = stressGrossIncome - stressMonthlyExpenses;
  const stressTestCashFlow = stressMonthlyNOI - stressMonthlyMortgage;
  const stressTestPass = stressTestCashFlow > 0;

  // 7. Investment Score (0-100)
  // Weighted calculation based on Cash on Cash (50%), Cap Rate (30%), and Monthly Cash Flow (20%)
  const cocScore = Math.min(100, Math.max(0, (cashOnCash / 12) * 100)); // 12% CoC is a "perfect" score part
  const capScore = Math.min(100, Math.max(0, (capRate / 8) * 100));   // 8% Cap Rate is a "perfect" score part
  const cashFlowScore = Math.min(100, Math.max(0, (monthlyCashFlow / 500) * 100)); // $500/mo is a "perfect" score part
  
  const investmentScore = Math.round((cocScore * 0.5) + (capScore * 0.3) + (cashFlowScore * 0.2));
  
  let investmentGrade = "F";
  if (investmentScore >= 90) investmentGrade = "A+";
  else if (investmentScore >= 80) investmentGrade = "A";
  else if (investmentScore >= 70) investmentGrade = "B";
  else if (investmentScore >= 60) investmentGrade = "C";
  else if (investmentScore >= 50) investmentGrade = "D";
  else investmentGrade = "F";

  // 8. Amortization Schedule
  const yearlyAmortization: AmortizationYear[] = [];
  let currentBalance = loanAmount;
  let yearlyInterest = 0;
  let yearlyPrincipal = 0;

  for (let i = 1; i <= numberOfPayments; i++) {
    const interestPayment = currentBalance * monthlyRate;
    const principalPayment = monthlyMortgage - interestPayment;
    
    yearlyInterest += interestPayment;
    yearlyPrincipal += principalPayment;
    currentBalance -= principalPayment;
    if (currentBalance < 0) currentBalance = 0;

    if (i % 12 === 0) {
      yearlyAmortization.push({
        year: i / 12,
        balance: Math.round(currentBalance),
        interestPaid: Math.round(yearlyInterest),
        principalPaid: Math.round(yearlyPrincipal),
        totalPaid: Math.round(yearlyInterest + yearlyPrincipal)
      });
      // Reset yearly accumulators
      yearlyInterest = 0;
      yearlyPrincipal = 0;
    }
  }

  // 9. Cumulative Profit (Appreciation assumed @ 2% linear for simplicity of this demo)
  const profitYears: ProfitYear[] = [];
  let cumCashFlow = -totalInitialCash; // Start negative
  let propertyValue = purchasePrice;
  let equity = downPaymentAmount; // Initial equity
  
  // Need to reconstruct balance per year for equity calculation more easily
  // Or just use the array we just built
  
  for (let year = 1; year <= 30; year++) {
    // 2% appreciation
    propertyValue = propertyValue * 1.02; 
    
    // Add annual cashflow
    cumCashFlow += annualCashFlow;
    
    // Equity = Value - Loan Balance
    const amortYear = yearlyAmortization.find(a => a.year === year);
    const balance = amortYear ? amortYear.balance : 0;
    equity = propertyValue - balance;

    profitYears.push({
      year,
      cumulativeCashFlow: Math.round(cumCashFlow),
      equity: Math.round(equity),
      totalValue: Math.round(cumCashFlow + equity) // Total wealth generated (cash in pocket + equity accessible)
    });
  }

  // Initial Mortgage split for display
  const initialMonthlyInterest = loanAmount * monthlyRate;
  const initialMonthlyPrincipal = monthlyMortgage - initialMonthlyInterest;

  return {
    monthlyMortgage,
    monthlyPrincipal: initialMonthlyPrincipal,
    monthlyInterest: initialMonthlyInterest,
    totalMonthlyExpenses,
    monthlyNOI,
    monthlyCashFlow,
    ownerEarningsMonthly,
    ownerEarningsAnnual,
    earningsYield,
    intrinsicValue,
    marginOfSafety,
    stressTestCashFlow,
    stressTestPass,
    capRate,
    cashOnCash,
    investmentScore,
    investmentGrade,
    totalInitialCash,
    yearlyAmortization,
    cumulativeProfit: profitYears
  };
}
