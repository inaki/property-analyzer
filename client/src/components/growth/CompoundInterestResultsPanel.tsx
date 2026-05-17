import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "react-i18next";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

interface CompoundInterestResultsPanelProps {
  budgetData: Array<{
    year: number;
    balance: number;
    grossMonthly: number;
    grossAnnual: number;
    netMonthly: number;
    netAnnual: number;
    netWeekly: number;
    netDaily: number;
    tax: number;
  }> | null;
  results: Array<Array<{ years: number; nominal: number; real: number; totalInvested: number; totalWithdrawn: number }>>;
  selectedBudgetYear: number;
  setSelectedBudgetYear: (v: number) => void;
  ages: number[];
  totalInvested: number[];
  initialBalanceGrowth: number[];
  parsedWithdrawalRate: number;
  rateScenarios: number[];
  milestoneYears: number[];
}

export function CompoundInterestResultsPanel({
  budgetData,
  results,
  selectedBudgetYear,
  setSelectedBudgetYear,
  ages,
  totalInvested,
  initialBalanceGrowth,
  parsedWithdrawalRate,
  rateScenarios,
  milestoneYears,
}: CompoundInterestResultsPanelProps) {
  const { t } = useTranslation();

  return (
    <>
      {parsedWithdrawalRate > 0 && budgetData && budgetData.length > 0 && (() => {
        const selected = budgetData[selectedBudgetYear] || budgetData[0];
        return (
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30">
              <h3 className="font-display font-semibold">{t("growth.budget.title")}</h3>
              <p className="text-xs text-muted-foreground">
                {t("growth.budget.subtitle", { rate: parsedWithdrawalRate })}
              </p>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground">{t("growth.budget.netMonthlyLabel")}</p>
                  <p className="text-lg font-mono font-semibold text-emerald-600">
                    {formatCurrency(selected.netMonthly)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {t("growth.budget.gross", { value: formatCurrency(selected.grossMonthly) })}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground">{t("growth.budget.weeklyLabel")}</p>
                  <p className="text-lg font-mono font-semibold text-emerald-600">
                    {formatCurrency(selected.netWeekly)}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground">{t("growth.budget.dailyLabel")}</p>
                  <p className="text-lg font-mono font-semibold text-emerald-600">
                    {formatCurrency(selected.netDaily)}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground">{t("growth.budget.taxLabel")}</p>
                  <p className="text-lg font-mono font-semibold text-orange-500">
                    {formatCurrency(selected.tax)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {selected.grossAnnual > 0
                      ? `${((selected.tax / selected.grossAnnual) * 100).toFixed(1)}%`
                      : "0%"}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mb-4">
                {t("growth.budget.referenceNote", { rate: 8, years: selected.year })}
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("growth.budget.yearCol")}</TableHead>
                    <TableHead className="text-right">{t("growth.budget.netMonthlyLabel")}</TableHead>
                    <TableHead className="text-right">{t("growth.budget.weeklyLabel")}</TableHead>
                    <TableHead className="text-right">{t("growth.budget.dailyLabel")}</TableHead>
                    <TableHead className="text-right">{t("growth.budget.taxLabel")}</TableHead>
                    <TableHead className="text-right">{t("growth.budget.balanceCol")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetData.map((row, idx) => (
                    <TableRow
                      key={row.year}
                      className={`cursor-pointer transition-colors ${idx === selectedBudgetYear ? "bg-emerald-500/10 border-l-2 border-l-emerald-500" : "hover:bg-muted/40"}`}
                      onClick={() => setSelectedBudgetYear(idx)}
                    >
                      <TableCell className="font-medium">
                        {t("growth.projections.years", { years: row.year })}
                      </TableCell>
                      <TableCell className="text-right font-mono text-emerald-600">
                        {formatCurrency(row.netMonthly)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-emerald-600">
                        {formatCurrency(row.netWeekly)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-emerald-600">
                        {formatCurrency(row.netDaily)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-orange-500">
                        {formatCurrency(row.tax)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {formatCurrency(row.balance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );
      })()}

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="font-display font-semibold">{t("growth.projections.title")}</h3>
          <p className="text-xs text-muted-foreground">{t("growth.projections.subtitle")}</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">{t("growth.projections.scenario")}</TableHead>
              {milestoneYears.map((years, index) => (
                <TableHead key={years} className="text-right">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground">
                      {t("growth.projections.years", { years })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("growth.projections.age", { age: ages[index] })}
                    </p>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="bg-muted/20">
              <TableCell className="font-medium text-foreground">
                {t("growth.projections.totalInvested")}
              </TableCell>
              {totalInvested.map((value, index) => (
                <TableCell
                  key={`total-${milestoneYears[index]}`}
                  className="text-right font-mono text-muted-foreground"
                >
                  {formatCurrency(value)}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell className="font-medium text-foreground">
                {t("growth.projections.initialBalanceGrowth")}
              </TableCell>
              {initialBalanceGrowth.map((value, index) => (
                <TableCell
                  key={`initial-${milestoneYears[index]}`}
                  className="text-right font-mono text-primary"
                >
                  {formatCurrency(value)}
                </TableCell>
              ))}
            </TableRow>
            {rateScenarios.map((rate, index) => (
              <TableRow key={rate}>
                <TableCell className="font-medium text-foreground">
                  {t("growth.projections.return", { rate })}
                </TableCell>
                {results[index].map((entry) => (
                  <TableCell key={`${rate}-${entry.years}`} className="text-right">
                    <div className="space-y-1">
                      <p className="font-mono text-emerald-600">
                        {formatCurrency(entry.nominal)}
                      </p>
                      {entry.totalWithdrawn > 0 && (
                        <p className="text-xs font-mono text-orange-500">
                          {t("growth.projections.withdrawn", {
                            value: formatCurrency(entry.totalWithdrawn),
                          })}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {t("growth.projections.earnings", {
                          value: formatCurrency(
                            entry.nominal + entry.totalWithdrawn - entry.totalInvested,
                          ),
                        })}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {t("growth.projections.real", { value: formatCurrency(entry.real) })}
                      </p>
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="font-display font-semibold">{t("growth.definitions.title")}</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-2 text-sm text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">{t("growth.definitions.totalInvested.title")}</p>
            <p>{t("growth.definitions.totalInvested.body")}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">
              {t("growth.definitions.initialBalanceGrowth.title")}
            </p>
            <p>{t("growth.definitions.initialBalanceGrowth.body")}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">{t("growth.definitions.nominal.title")}</p>
            <p>{t("growth.definitions.nominal.body")}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">{t("growth.definitions.real.title")}</p>
            <p>{t("growth.definitions.real.body")}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">{t("growth.definitions.earnings.title")}</p>
            <p>{t("growth.definitions.earnings.body")}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">{t("growth.definitions.age.title")}</p>
            <p>{t("growth.definitions.age.body")}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">{t("growth.definitions.withdrawalRate.title")}</p>
            <p>{t("growth.definitions.withdrawalRate.body")}</p>
          </div>
        </div>
      </div>
    </>
  );
}
