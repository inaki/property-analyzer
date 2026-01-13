export type DebtInput = {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minPayment: number;
};

export type DebtStrategy = "avalanche" | "snowball" | "hybrid";

export type DebtPayoffRow = {
  month: number;
  totalBalance: number;
  totalInterestPaid: number;
  interestThisMonth: number;
  balances: Record<string, number>;
};

export type DebtPayoffSummary = {
  id: string;
  name: string;
  monthsToPayoff: number;
  interestPaid: number;
};

export type DebtSimulationResult = {
  schedule: DebtPayoffRow[];
  payoffSummaries: DebtPayoffSummary[];
  totalInterestPaid: number;
  totalMonths: number;
};

function pickPriority(
  debts: DebtInput[],
  strategy: DebtStrategy,
  hybridThreshold: number,
) {
  if (strategy === "avalanche") {
    return [...debts].sort((a, b) => b.apr - a.apr || b.balance - a.balance);
  }

  if (strategy === "snowball") {
    return [...debts].sort((a, b) => a.balance - b.balance || b.apr - a.apr);
  }

  const aboveThreshold = debts.filter((debt) => debt.apr >= hybridThreshold);
  if (aboveThreshold.length > 0) {
    return [...aboveThreshold, ...debts.filter((debt) => debt.apr < hybridThreshold)].sort(
      (a, b) => b.apr - a.apr || a.balance - b.balance,
    );
  }

  return [...debts].sort((a, b) => a.balance - b.balance || b.apr - a.apr);
}

export function getPriorityOrder(params: {
  debts: DebtInput[];
  strategy: DebtStrategy;
  hybridThreshold: number;
}): DebtInput[] {
  return pickPriority(params.debts, params.strategy, params.hybridThreshold);
}

export function simulateDebtPayoff(params: {
  debts: DebtInput[];
  extraPayment: number;
  strategy: DebtStrategy;
  hybridThreshold: number;
  maxMonths?: number;
}): DebtSimulationResult {
  const maxMonths = params.maxMonths ?? 600;
  type WorkingDebt = DebtInput & { interestPaid: number };
  const debts: WorkingDebt[] = params.debts
    .filter((debt) => debt.balance > 0)
    .map((debt) => ({ ...debt, interestPaid: 0 }));
  const allDebtIds = params.debts.map((debt) => debt.id);
  const baseMinimum = params.debts.reduce((sum, debt) => sum + debt.minPayment, 0);
  const payoffSummaries: Record<string, DebtPayoffSummary> = {};
  const schedule: DebtPayoffRow[] = [];
  let totalInterestPaid = 0;

  for (let month = 1; month <= maxMonths; month += 1) {
    if (debts.length === 0) {
      break;
    }

    const monthlyBudget = Math.max(0, params.extraPayment) + baseMinimum;
    let interestThisMonth = 0;

    for (const debt of debts) {
      const monthlyRate = debt.apr / 100 / 12;
      const interest = debt.balance * monthlyRate;
      debt.balance += interest;
      debt.interestPaid += interest;
      totalInterestPaid += interest;
      interestThisMonth += interest;
    }

    let usedBudget = 0;
    for (const debt of debts) {
      const payment = Math.min(debt.minPayment, debt.balance);
      debt.balance -= payment;
      usedBudget += payment;
    }

    let availableExtra = Math.max(0, monthlyBudget - usedBudget);
    const priority = pickPriority(debts, params.strategy, params.hybridThreshold);
    for (const debt of priority) {
      if (availableExtra <= 0) break;
      const payment = Math.min(availableExtra, debt.balance);
      debt.balance -= payment;
      availableExtra -= payment;
    }

    for (let i = debts.length - 1; i >= 0; i -= 1) {
      const debt = debts[i];
      if (debt.balance <= 0.01) {
        if (!payoffSummaries[debt.id]) {
          payoffSummaries[debt.id] = {
            id: debt.id,
            name: debt.name,
            monthsToPayoff: month,
            interestPaid: debt.interestPaid,
          };
        }
        debts.splice(i, 1);
      }
    }

    const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
    const balances: Record<string, number> = {};
    for (const id of allDebtIds) {
      const match = debts.find((debt) => debt.id === id);
      balances[id] = match ? Math.max(0, match.balance) : 0;
    }
    schedule.push({
      month,
      totalBalance,
      totalInterestPaid,
      interestThisMonth,
      balances,
    });
  }

  const totalMonths = schedule.length;
  const payoffSummariesArray = [
    ...Object.values(payoffSummaries),
    ...debts.map((debt) => ({
      id: debt.id,
      name: debt.name,
      monthsToPayoff: totalMonths,
      interestPaid: debt.interestPaid,
    })),
  ];

  return {
    schedule,
    payoffSummaries: payoffSummariesArray,
    totalInterestPaid,
    totalMonths,
  };
}
