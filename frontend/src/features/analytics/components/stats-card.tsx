import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  previousValue?: number;
  icon?: ReactNode;
  description?: string;
}

export function StatsCard({ title, value, previousValue, icon, description }: StatsCardProps) {
  const calculateTrend = () => {
    if (!previousValue) return null;
    const current = typeof value === 'string' ? parseFloat(value) : value;
    const percentageChange = ((current - previousValue) / previousValue) * 100;
    return {
      value: percentageChange,
      isPositive: percentageChange > 0
    };
  };

  const trend = calculateTrend();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className={`text-xs ${trend.isPositive ? 'text-green-500' : 'text-red-500'} mt-1`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
            {description && <span className="text-muted-foreground ml-1">{description}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  );
}