import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import Home from "@/pages/Home";
import SavedAnalyses from "@/pages/SavedAnalyses";
import Buyd from "@/pages/Buyd";
import CompoundInterest from "@/pages/CompoundInterest";
import Debt from "@/pages/Debt";
import BalanceSheet from "@/pages/BalanceSheet";
import PersonalFinance from "@/pages/PersonalFinance";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/saved" component={SavedAnalyses} />
      <Route path="/buyd" component={Buyd} />
      <Route path="/growth" component={CompoundInterest} />
      <Route path="/balance-sheet" component={BalanceSheet} />
      <Route path="/personal-finance" component={PersonalFinance} />
      <Route path="/debt" component={Debt} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
