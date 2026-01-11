import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAnalysisSchema, type InsertAnalysis } from "@shared/schema";
import { useCreateAnalysis } from "@/hooks/use-analyses";
import { useToast } from "@/hooks/use-toast";
import { calculateMetrics } from "@/lib/financials";

import { Layout } from "@/components/Layout";
import { CalculatorForm } from "@/components/CalculatorForm";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, RefreshCw, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const defaultValues: InsertAnalysis = {
  title: "New Investment Analysis",
  purchasePrice: 250000,
  renovationCost: 15000,
  closingCosts: 8000,
  downPaymentPercent: "20",
  interestRate: "6.5",
  loanTermYears: 30,
  monthlyRent: 2400,
  otherMonthlyIncome: 0,
  vacancyRatePercent: "5",
  propertyTaxYearly: 1200,
  insuranceYearly: 1000,
  hoaMonthly: 150,
  utilitiesMonthly: 0,
  maintenancePercent: "5",
  managementFeePercent: "0",
  otherMonthlyExpenses: 0,
};

export default function Home() {
  const { toast } = useToast();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  
  const createMutation = useCreateAnalysis();

  const form = useForm<InsertAnalysis>({
    resolver: zodResolver(insertAnalysisSchema),
    defaultValues,
    mode: "onChange"
  });

  // Watch all fields for real-time calculation
  const values = form.watch();
  const metrics = calculateMetrics(values);

  const handleSave = async () => {
    if (!title) {
      toast({
        title: "Title Required",
        description: "Please give your analysis a name.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        ...values,
        title,
        description: `Analysis for ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(values.purchasePrice))}`
      });
      
      toast({
        title: "Analysis Saved",
        description: "Your property analysis has been saved successfully.",
      });
      setSaveDialogOpen(false);
      setTitle("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save analysis. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    form.reset(defaultValues);
    toast({ title: "Calculator Reset", description: "Values returned to defaults." });
  };

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
        
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Investment Calculator</h1>
            <p className="text-muted-foreground mt-1">Analyze cash flow, cap rate, and ROI instantly.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="h-10">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                  <Save className="mr-2 h-4 w-4" />
                  Save Analysis
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Analysis</DialogTitle>
                  <DialogDescription>
                    Give this calculation a name to save it to your history.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input 
                    placeholder="e.g. 123 Calle San Juan" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={createMutation.isPending}>
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : "Save Analysis"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-card rounded-xl shadow-sm border border-border p-6 h-full">
              <FormProvider {...form}>
                <CalculatorForm />
              </FormProvider>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="xl:col-span-8 space-y-6">
            <ResultsDashboard metrics={metrics} />
          </div>

        </div>
      </div>
    </Layout>
  );
}
