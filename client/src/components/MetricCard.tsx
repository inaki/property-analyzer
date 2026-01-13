import { cn } from "@/lib/utils";
import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: ReactNode;
  subValue?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
  description?: string;
}

export function MetricCard({ 
  title, 
  value, 
  subValue, 
  icon: Icon, 
  trend, 
  className,
  description 
}: MetricCardProps) {
  const isPositive = trend === "up";
  const isNegative = trend === "down";

  return (
    <Card className={cn("overflow-hidden border-none shadow-md bg-card/50 backdrop-blur-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground font-display">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground opacity-70" />}
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-2xl font-bold tracking-tight font-mono",
          isPositive && "text-emerald-600 dark:text-emerald-400",
          isNegative && "text-rose-600 dark:text-rose-400"
        )}>
          {value}
        </div>
        {(subValue || description) && (
          <p className="text-xs text-muted-foreground mt-1">
            {subValue}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
