import { CalculationResult } from "@/lib/financials";
import { MetricCard } from "./MetricCard";
import { AnimatedNumber } from "./AnimatedNumber";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  BarChart,
  Bar
} from "recharts";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface ResultsDashboardProps {
  metrics: CalculationResult;
}

export function ResultsDashboard({ metrics }: ResultsDashboardProps) {
  const { t } = useTranslation();
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  
  const formatPercent = (val: number) => 
    `${val.toFixed(2)}%`;

  // Pie Chart Data
  const expensesData = [
    { name: t("results.breakdown.mortgage"), value: metrics.monthlyMortgage },
    { name: t("results.breakdown.operatingExpenses"), value: metrics.totalMonthlyExpenses },
    { name: t("results.breakdown.netCashFlow"), value: Math.max(0, metrics.monthlyCashFlow) }
  ];
  const COLORS = ["#6366f1", "#e11d48", "#10b981"]; // Indigo, Rose, Emerald

  return (
    <div className="space-y-6">
      {/* Investment Score Card */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-display font-bold flex items-center gap-2">
              {t("results.investmentScore.title")}
              <Badge variant={metrics.investmentScore > 60 ? "default" : "destructive"} className="text-lg px-3">
                {t("results.investmentScore.grade", { grade: metrics.investmentGrade })}
              </Badge>
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t("results.investmentScore.subtitle")}
            </p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-bold text-primary">{metrics.investmentScore}</span>
            <span className="text-muted-foreground ml-1">/ 100</span>
          </div>
        </div>
        <Progress value={metrics.investmentScore} className="h-3" />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{t("results.investmentScore.scale.poor")}</span>
          <span>{t("results.investmentScore.scale.fair")}</span>
          <span>{t("results.investmentScore.scale.good")}</span>
          <span>{t("results.investmentScore.scale.excellent")}</span>
        </div>
      </div>

      {/* Top Level Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={t("results.metrics.monthlyCashFlow.title")}
          value={<AnimatedNumber value={metrics.monthlyCashFlow} format={formatCurrency} />}
          trend={metrics.monthlyCashFlow > 0 ? "up" : "down"}
          description={t("results.metrics.monthlyCashFlow.description")}
        />
        <MetricCard
          title={t("results.metrics.capRate.title")}
          value={<AnimatedNumber value={metrics.capRate} format={formatPercent} />}
          description={t("results.metrics.capRate.description")}
        />
        <MetricCard
          title={t("results.metrics.cashOnCash.title")}
          value={<AnimatedNumber value={metrics.cashOnCash} format={formatPercent} />}
          description={t("results.metrics.cashOnCash.description")}
        />
        <MetricCard
          title={t("results.metrics.initialCash.title")}
          value={<AnimatedNumber value={metrics.totalInitialCash} format={formatCurrency} />}
          description={t("results.metrics.initialCash.description")}
        />
      </div>

      {/* Berkshire Lens */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-display font-bold">{t("results.berkshire.title")}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t("results.berkshire.subtitle")}
            </p>
          </div>
          <Badge variant={metrics.stressTestPass ? "default" : "destructive"}>
            {t("results.berkshire.stressStatus", { status: metrics.stressTestPass ? t("results.berkshire.pass") : t("results.berkshire.fail") })}
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <MetricCard
            title={t("results.berkshire.ownerEarnings.title")}
            value={<AnimatedNumber value={metrics.ownerEarningsMonthly} format={formatCurrency} />}
            trend={metrics.ownerEarningsMonthly > 0 ? "up" : "down"}
            description={t("results.berkshire.ownerEarnings.description")}
          />
          <MetricCard
            title={t("results.berkshire.earningsYield.title")}
            value={<AnimatedNumber value={metrics.earningsYield} format={formatPercent} />}
            trend={metrics.earningsYield >= 10 ? "up" : "neutral"}
            description={t("results.berkshire.earningsYield.description")}
          />
          <MetricCard
            title={t("results.berkshire.intrinsicValue.title")}
            value={<AnimatedNumber value={metrics.intrinsicValue} format={formatCurrency} />}
            description={t("results.berkshire.intrinsicValue.description")}
          />
          <MetricCard
            title={t("results.berkshire.marginOfSafety.title")}
            value={<AnimatedNumber value={metrics.marginOfSafety} format={formatPercent} />}
            trend={metrics.marginOfSafety >= 25 ? "up" : "down"}
            description={t("results.berkshire.marginOfSafety.description")}
          />
          <MetricCard
            title={t("results.berkshire.stressCashFlow.title")}
            value={<AnimatedNumber value={metrics.stressTestCashFlow} format={formatCurrency} />}
            trend={metrics.stressTestCashFlow > 0 ? "up" : "down"}
            description={t("results.berkshire.stressCashFlow.description")}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          {t("results.berkshire.assumptions")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-card rounded-xl p-6 shadow-sm border border-border">
          <Tabs defaultValue="projections" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-bold">{t("results.projections.title")}</h3>
              <TabsList className="grid w-full max-w-[300px] grid-cols-2">
                <TabsTrigger value="projections">{t("results.projections.tabs.longTerm")}</TabsTrigger>
                <TabsTrigger value="amortization">{t("results.projections.tabs.amortization")}</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="projections" className="h-[300px] mt-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.cumulativeProfit} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                  <XAxis 
                    dataKey="year" 
                    tick={{fontSize: 12, fill: '#888'}} 
                    tickLine={false}
                    axisLine={false}
                    label={{ value: t("results.projections.yearsLabel"), position: 'insideBottomRight', offset: -5 }}
                  />
                  <YAxis 
                    tick={{fontSize: 12, fill: '#888'}} 
                    tickFormatter={(val) => `$${val/1000}k`} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="equity" stackId="1" stroke="#6366f1" fill="url(#colorEquity)" name={t("results.projections.equityLabel")} />
                  <Area type="monotone" dataKey="cumulativeCashFlow" stackId="2" stroke="#10b981" fill="url(#colorTotal)" name={t("results.projections.cashFlowLabel")} />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="amortization" className="h-[300px] mt-0">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.yearlyAmortization} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                  <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{fontSize: 12, fill: '#888'}} />
                  <YAxis tickFormatter={(val) => `$${val/1000}k`} tickLine={false} axisLine={false} tick={{fontSize: 12, fill: '#888'}} />
                  <RechartsTooltip 
                    cursor={{fill: 'transparent'}}
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="interestPaid" stackId="a" fill="#e11d48" name={t("results.projections.interest")} radius={[0, 0, 4, 4]} />
                  <Bar dataKey="principalPaid" stackId="a" fill="#6366f1" name={t("results.projections.principal")} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </div>

        {/* Breakdown Panel */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border flex flex-col">
          <h3 className="text-lg font-display font-bold mb-4">{t("results.breakdown.title")}</h3>
          <div className="flex-1 min-h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expensesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{t("results.breakdown.noi")}</p>
                <p className="font-bold text-lg">{formatCurrency(metrics.monthlyNOI)}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span>{t("results.breakdown.mortgage")}</span>
              </div>
              <span className="font-mono">{formatCurrency(metrics.monthlyMortgage)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-600" />
                <span>{t("results.breakdown.operatingExpenses")}</span>
              </div>
              <span className="font-mono">{formatCurrency(metrics.totalMonthlyExpenses)}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-medium pt-2 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>{t("results.breakdown.netCashFlow")}</span>
              </div>
              <span className={metrics.monthlyCashFlow > 0 ? "text-emerald-600" : "text-rose-600"}>
                {formatCurrency(metrics.monthlyCashFlow)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Detailed Amortization Table */}
       <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="font-display font-bold text-sm">{t("results.amortization.title")}</h3>
        </div>
        <ScrollArea className="h-[250px]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[100px]">{t("results.amortization.year")}</TableHead>
                <TableHead className="text-right">{t("results.amortization.interestPaid")}</TableHead>
                <TableHead className="text-right">{t("results.amortization.principalPaid")}</TableHead>
                <TableHead className="text-right">{t("results.amortization.remainingBalance")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.yearlyAmortization.slice(0, 5).map((row) => (
                <TableRow key={row.year} className="group">
                  <TableCell className="font-medium group-hover:text-primary transition-colors">
                    {t("results.amortization.yearLabel", { year: row.year })}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">{formatCurrency(row.interestPaid)}</TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">{formatCurrency(row.principalPaid)}</TableCell>
                  <TableCell className="text-right font-mono font-medium">{formatCurrency(row.balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
