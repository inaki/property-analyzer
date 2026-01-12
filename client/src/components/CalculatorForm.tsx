import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
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
import { Badge } from "@/components/ui/badge";
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
import { Percent, DollarSign } from "lucide-react";

export function CalculatorForm() {
  const form = useFormContext<InsertAnalysis>();
  const { t } = useTranslation();

  return (
    <div className="space-y-8 p-1">
      {/* Property Details Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
          <span className="w-1 h-6 bg-primary rounded-full inline-block"></span>
          {t("property.form.sections.purchase")}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("property.form.purchasePrice")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                      className="pl-9 font-mono" 
                      placeholder={t("property.form.placeholders.purchasePrice")}
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
                <FormLabel>{t("property.form.closingCosts")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                      className="pl-9 font-mono" 
                      placeholder={t("property.form.placeholders.closingCosts")}
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
                <FormLabel>{t("property.form.renovationCost")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                      className="pl-9 font-mono" 
                      placeholder={t("property.form.placeholders.renovationCost")}
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
          {t("property.form.sections.financing")}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="downPaymentPercent"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2">
                <FormLabel className="flex justify-between">
                  <span>{t("property.form.downPayment")}</span>
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
                <FormLabel>{t("property.form.interestRate")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="number"
                      step="0.01"
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.value)}
                      className="pl-9 font-mono" 
                      placeholder={t("property.form.placeholders.interestRate")}
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
                <FormLabel>{t("property.form.loanTerm")}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("property.form.selectTerm")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="30">{t("property.form.loanYears", { years: 30 })}</SelectItem>
                    <SelectItem value="20">{t("property.form.loanYears", { years: 20 })}</SelectItem>
                    <SelectItem value="15">{t("property.form.loanYears", { years: 15 })}</SelectItem>
                    <SelectItem value="10">{t("property.form.loanYears", { years: 10 })}</SelectItem>
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
          {t("property.form.sections.incomeExpenses")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="monthlyRent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("property.form.monthlyRent")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="number"
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                      className="pl-9 font-mono bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900" 
                      placeholder={t("property.form.placeholders.monthlyRent")}
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
                <FormLabel>{t("property.form.vacancyRate")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="number"
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.value)}
                      className="pl-9 font-mono" 
                      placeholder={t("property.form.placeholders.vacancyRate")}
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
              {t("property.form.sections.detailedExpenses")}
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <FormField
                  control={form.control}
                  name="propertyTaxYearly"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        {t("property.form.propertyTaxYearly")}
                        <Badge variant="outline" className="text-[10px] h-4">{t("property.form.puertoRico")}</Badge>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number"
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                            className="pl-9 font-mono" 
                            placeholder={t("property.form.placeholders.propertyTaxYearly")}
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        {t("property.form.propertyTaxHint")}
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
                      <FormLabel>{t("property.form.insuranceYearly")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number"
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                            className="pl-9 font-mono" 
                            placeholder={t("property.form.placeholders.insuranceYearly")}
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
                      <FormLabel>{t("property.form.hoaMonthly")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number"
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                            className="pl-9 font-mono" 
                            placeholder={t("property.form.placeholders.hoaMonthly")}
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
                      <FormLabel>{t("property.form.maintenancePercent")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number"
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.value)}
                            className="pl-9 font-mono" 
                            placeholder={t("property.form.placeholders.maintenancePercent")}
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
                      <FormLabel>{t("property.form.managementFeePercent")}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="number"
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value === "" ? "" : e.target.value)}
                            className="pl-9 font-mono" 
                            placeholder={t("property.form.placeholders.managementFeePercent")}
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
