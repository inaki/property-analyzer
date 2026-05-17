import { Layout } from "@/components/Layout";
import { useTranslation } from "react-i18next";
import { BookOpen } from "lucide-react";

type FormulaItem = {
  title: string;
  formula: string;
  use: string;
  example: string;
};

export default function Formulas() {
  const { t } = useTranslation();

  const mustMemorize: FormulaItem[] = [
    {
      title: t("formulas.items.roi.title"),
      formula: t("formulas.items.roi.formula"),
      use: t("formulas.items.roi.use"),
      example: t("formulas.items.roi.example"),
    },
    {
      title: t("formulas.items.compound.title"),
      formula: t("formulas.items.compound.formula"),
      use: t("formulas.items.compound.use"),
      example: t("formulas.items.compound.example"),
    },
    {
      title: t("formulas.items.rule72.title"),
      formula: t("formulas.items.rule72.formula"),
      use: t("formulas.items.rule72.use"),
      example: t("formulas.items.rule72.example"),
    },
    {
      title: t("formulas.items.debtEquity.title"),
      formula: t("formulas.items.debtEquity.formula"),
      use: t("formulas.items.debtEquity.use"),
      example: t("formulas.items.debtEquity.example"),
    },
    {
      title: t("formulas.items.dti.title"),
      formula: t("formulas.items.dti.formula"),
      use: t("formulas.items.dti.use"),
      example: t("formulas.items.dti.example"),
    },
    {
      title: t("formulas.items.savingsRate.title"),
      formula: t("formulas.items.savingsRate.formula"),
      use: t("formulas.items.savingsRate.use"),
      example: t("formulas.items.savingsRate.example"),
    },
    {
      title: t("formulas.items.cashFlow.title"),
      formula: t("formulas.items.cashFlow.formula"),
      use: t("formulas.items.cashFlow.use"),
      example: t("formulas.items.cashFlow.example"),
    },
  ];

  const recognize: FormulaItem[] = [
    {
      title: t("formulas.items.presentValue.title"),
      formula: t("formulas.items.presentValue.formula"),
      use: t("formulas.items.presentValue.use"),
      example: t("formulas.items.presentValue.example"),
    },
    {
      title: t("formulas.items.irr.title"),
      formula: t("formulas.items.irr.formula"),
      use: t("formulas.items.irr.use"),
      example: t("formulas.items.irr.example"),
    },
    {
      title: t("formulas.items.npv.title"),
      formula: t("formulas.items.npv.formula"),
      use: t("formulas.items.npv.use"),
      example: t("formulas.items.npv.example"),
    },
  ];

  const valuation: FormulaItem[] = [
    {
      title: t("formulas.items.eps.title"),
      formula: t("formulas.items.eps.formula"),
      use: t("formulas.items.eps.use"),
      example: t("formulas.items.eps.example"),
    },
    {
      title: t("formulas.items.pe.title"),
      formula: t("formulas.items.pe.formula"),
      use: t("formulas.items.pe.use"),
      example: t("formulas.items.pe.example"),
    },
  ];

  const portfolio: FormulaItem[] = [
    {
      title: t("formulas.items.expectedReturn.title"),
      formula: t("formulas.items.expectedReturn.formula"),
      use: t("formulas.items.expectedReturn.use"),
      example: t("formulas.items.expectedReturn.example"),
    },
    {
      title: t("formulas.items.stdev.title"),
      formula: t("formulas.items.stdev.formula"),
      use: t("formulas.items.stdev.use"),
      example: t("formulas.items.stdev.example"),
    },
  ];

  const realEstate: FormulaItem[] = [
    {
      title: t("formulas.items.capRate.title"),
      formula: t("formulas.items.capRate.formula"),
      use: t("formulas.items.capRate.use"),
      example: t("formulas.items.capRate.example"),
    },
    {
      title: t("formulas.items.coc.title"),
      formula: t("formulas.items.coc.formula"),
      use: t("formulas.items.coc.use"),
      example: t("formulas.items.coc.example"),
    },
  ];

  const renderItems = (items: FormulaItem[]) => (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <div key={item.title} className="rounded-lg border border-border/60 bg-card p-4 space-y-3">
          <p className="font-medium text-foreground">{item.title}</p>
          <div className="rounded-md bg-muted/40 px-3 py-2 font-mono text-sm text-foreground">
            {item.formula}
          </div>
          <p className="text-sm text-muted-foreground">{item.use}</p>
          <div className="rounded-md bg-muted/30 px-3 py-3 text-sm text-muted-foreground">
            <p className="whitespace-pre-line leading-loose">{item.example}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <BookOpen className="h-4 w-4" />
            {t("formulas.badge")}
          </div>
          <h1 className="text-3xl font-display font-bold">{t("formulas.title")}</h1>
          <p className="text-muted-foreground">{t("formulas.subtitle")}</p>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
          <h3 className="font-display font-semibold">{t("formulas.sections.mustMemorize")}</h3>
          {renderItems(mustMemorize)}
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
          <h3 className="font-display font-semibold">{t("formulas.sections.recognize")}</h3>
          {renderItems(recognize)}
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
          <h3 className="font-display font-semibold">{t("formulas.sections.valuation")}</h3>
          {renderItems(valuation)}
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
          <h3 className="font-display font-semibold">{t("formulas.sections.portfolio")}</h3>
          {renderItems(portfolio)}
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
          <h3 className="font-display font-semibold">{t("formulas.sections.realEstate")}</h3>
          {renderItems(realEstate)}
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-3">
          <h3 className="font-display font-semibold">{t("formulas.sections.advisorMindset")}</h3>
          <p className="text-sm text-muted-foreground">{t("formulas.mindset.body")}</p>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-3">
          <h3 className="font-display font-semibold">{t("formulas.sections.cheatSheet")}</h3>
          <p className="text-sm text-muted-foreground">{t("formulas.cheatSheet.subtitle")}</p>
          <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
            <p>{t("formulas.cheatSheet.items.roi")}</p>
            <p>{t("formulas.cheatSheet.items.compound")}</p>
            <p>{t("formulas.cheatSheet.items.rule72")}</p>
            <p>{t("formulas.cheatSheet.items.debtEquity")}</p>
            <p>{t("formulas.cheatSheet.items.cashFlow")}</p>
            <p>{t("formulas.cheatSheet.items.savingsRate")}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
