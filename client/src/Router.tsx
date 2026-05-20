import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import SavedAnalyses from "@/pages/SavedAnalyses";
import Buyd from "@/pages/Buyd";
import CompoundInterest from "@/pages/CompoundInterest";
import Debt from "@/pages/Debt";
import BalanceSheet from "@/pages/BalanceSheet";
import PersonalFinance from "@/pages/PersonalFinance";
import AdvisoryFees from "@/pages/AdvisoryFees";
import Formulas from "@/pages/Formulas";
import NotFound from "@/pages/not-found";

export function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/saved" component={SavedAnalyses} />
      <Route path="/buyd" component={Buyd} />
      <Route path="/growth" component={CompoundInterest} />
      <Route path="/balance-sheet" component={BalanceSheet} />
      <Route path="/personal-finance" component={PersonalFinance} />
      <Route path="/advisory-fees" component={AdvisoryFees} />
      <Route path="/formulas" component={Formulas} />
      <Route path="/debt" component={Debt} />
      <Route component={NotFound} />
    </Switch>
  );
}
