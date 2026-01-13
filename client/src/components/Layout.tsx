import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { 
  Calculator, 
  History, 
  PieChart, 
  TrendingUp,
  ArrowUpRight,
  CreditCard,
  Moon,
  Sun
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { href: "/", label: t("nav.propertyAnalyser"), icon: Calculator },
    { href: "/buyd", label: t("nav.buyd"), icon: PieChart },
    { href: "/growth", label: t("nav.growthCalculator"), icon: TrendingUp },
    { href: "/debt", label: t("nav.debt"), icon: CreditCard },
    { href: "/saved", label: t("nav.savedAnalyses"), icon: History },
  ];

  const handleLanguageChange = (language: "en" | "es") => {
    i18n.changeLanguage(language);
    localStorage.setItem("lang", language);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-body">
      {/* Sidebar / Mobile Header */}
      <aside className="w-full md:w-64 lg:w-72 bg-card border-r border-border shrink-0 flex flex-col sticky top-0 md:h-screen z-40">
        <div className="p-6 border-b border-border/50 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <ArrowUpRight className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight tracking-tight">{t("app.title")}</h1>
            <p className="text-xs text-muted-foreground">{t("app.subtitle")}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pb-4">
          <p className="text-xs text-muted-foreground mb-2">{t("app.language")}</p>
          <div className="flex gap-2">
            <Button
              variant={i18n.language === "en" ? "default" : "outline"}
              size="sm"
              onClick={() => handleLanguageChange("en")}
            >
              EN
            </Button>
            <Button
              variant={i18n.language === "es" ? "default" : "outline"}
              size="sm"
              onClick={() => handleLanguageChange("es")}
            >
              ES
            </Button>
          </div>
        </div>

        <div className="px-4 pb-4">
          <p className="text-xs text-muted-foreground mb-2">{t("app.theme")}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full justify-between"
            disabled={!mounted}
          >
            <span>{t(theme === "dark" ? "app.themeDark" : "app.themeLight")}</span>
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
