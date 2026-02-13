import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, description, trend, trendValue, icon, className }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md border-l-4 border-l-primary", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground/50">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {(description || trend) && (
          <div className="flex items-center mt-2 text-xs text-muted-foreground">
            {trend === "up" && <ArrowUp className="w-3 h-3 text-emerald-500 mr-1" />}
            {trend === "down" && <ArrowDown className="w-3 h-3 text-red-500 mr-1" />}
            {trend === "neutral" && <Minus className="w-3 h-3 mr-1" />}
            <span className={cn(
              "font-medium mr-2",
              trend === "up" ? "text-emerald-500" : 
              trend === "down" ? "text-red-500" : ""
            )}>
              {trendValue}
            </span>
            {description}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
