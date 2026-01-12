import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Calculator, 
  History, 
  PieChart, 
  TrendingUp,
  Building2
} from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Property Analyser", icon: Calculator },
    { href: "/buyd", label: "BUYD", icon: PieChart },
    { href: "/growth", label: "Growth Calculator", icon: TrendingUp },
    { href: "/saved", label: "Saved Analyses", icon: History },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-body">
      {/* Sidebar / Mobile Header */}
      <aside className="w-full md:w-64 lg:w-72 bg-card border-r border-border shrink-0 flex flex-col sticky top-0 md:h-screen z-40">
        <div className="p-6 border-b border-border/50 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight tracking-tight">Investments</h1>
            <p className="text-xs text-muted-foreground">Puerto Rico Edition</p>
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

        <div className="p-4 border-t border-border/50">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-4 text-white shadow-xl">
            <h4 className="font-display font-bold text-sm mb-1">Pro Tip</h4>
            <p className="text-xs text-slate-300 opacity-90 leading-relaxed">
              Don't forget CRIM property taxes. In PR, use assessed value (~1957 value), not market value.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
