import { useFormContext } from "react-hook-form";
import { type InsertAnalysis } from "@shared/schema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Percent, DollarSign, Info } from "lucide-react";

export function CalculatorForm() {
  const form = useFormContext<InsertAnalysis>();

  return (
    <div className="space-y-8 p-1">
      {/* Property Details Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
          <span className="w-1 h-6 bg-primary rounded-full inline-block"></span>
          Purchase Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Price</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                      className="pl-9 font-mono" 
                      placeholder="250000" 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="closingCosts"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Closing Costs</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                      className="pl-9 font-mono" 
                      placeholder="8000" 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="renovationCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Renovation Budget</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                      className="pl-9 font-mono" 
                      placeholder="15000" 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>

      <Separator />

      {/* Financing Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
          <span className="w-1 h-6 bg-accent rounded-full inline-block"></span>
          Financing
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="downPaymentPercent"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel className="flex justify-between">
                  <span>Down Payment</span>
                  <span className="text-primary font-bold">{field.value}%</span>
                </FormLabel>
                <FormControl>
                  <Slider 
                    min={0} 
                    max={100} 
                    step={1} 
                    value={[Number(field.value)]} 
                    onValueChange={(val) => field.onChange(val[0])}
                    className="py-4"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="interestRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interest Rate (%)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="number"
                      step="0.01"
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.value)}
                      className="pl-9 font-mono" 
                      placeholder="6.5" 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="loanTermYears"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loan Term</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="30">30 Years</SelectItem>
                    <SelectItem value="20">20 Years</SelectItem>
                    <SelectItem value="15">15 Years</SelectItem>
                    <SelectItem value="10">10 Years</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </section>

      <Separator />

      {/* Income & Expenses */}
      <section className="space-y-4">
        <h3 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
          <span className="w-1 h-6 bg-emerald-500 rounded-full inline-block"></span>
          Income & Expenses
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="monthlyRent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Rent</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="number"
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                      className="pl-9 font-mono bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900" 
                      placeholder="2500" 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vacancyRatePercent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vacancy Rate (%)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="number"
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.value)}
                      className="pl-9 font-mono" 
                      placeholder="5" 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="expenses" className="border-none">
            <AccordionTrigger className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Detailed Expenses
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <FormField
                  control={form.control}
                  name="propertyTaxYearly"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Yearly CRIM Property Tax
                        <Badge variant="outline" className="text-[10px] h-4">Puerto Rico</Badge>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number"
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                            className="pl-9 font-mono" 
                            placeholder="1200" 
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        PR effective rate ~0.39% of 1957 assessed value
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="insuranceYearly"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yearly Insurance</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number"
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                            className="pl-9 font-mono" 
                            placeholder="1000" 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hoaMonthly"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly HOA</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number"
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                            className="pl-9 font-mono" 
                            placeholder="150" 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maintenancePercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maintenance (%)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number"
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.value)}
                            className="pl-9 font-mono" 
                            placeholder="5" 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="managementFeePercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Management Fee (%)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number"
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.value)}
                            className="pl-9 font-mono" 
                            placeholder="8" 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </div>
  );
}
