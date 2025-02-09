import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Scatter } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { formatNumber, formatDate, formatCurrency } from '@/lib/utils';

interface AdvancedCostInsightsProps {
  rawEvents: Array<{
    timestamp: string;
    model: string;
    tokens: number;
    prompt_tokens: number;
    completion_tokens: number;
    cost: number;
    metadata: {
      generation_time: number;
      tokens_per_second: number;
    };
  }>;
}

const chartConfig = {
  costEfficiency: {
    label: "Cost Efficiency",
    color: "hsl(var(--chart-1))",
  },
  tokenUtilization: {
    label: "Token Utilization",
    color: "hsl(var(--chart-2))",
  },
  optimizationScore: {
    label: "Optimization Score",
    color: "hsl(var(--chart-3))",
  },
} as const;

export function AdvancedCostInsights({ rawEvents }: AdvancedCostInsightsProps) {
  // Calculate advanced metrics
  const insights = rawEvents.reduce((acc, event) => {
    const date = event.timestamp.split('T')[0];
    if (!acc[date]) {
      acc[date] = {
        timestamp: date,
        totalCost: 0,
        totalTokens: 0,
        costPerToken: 0,
        tokenUtilization: 0,
        events: [],
      };
    }
    
    acc[date].events.push(event);
    acc[date].totalCost += event.cost;
    acc[date].totalTokens += event.tokens;
    
    return acc;
  }, {} as Record<string, any>);

  // Process daily metrics
  const costData = Object.values(insights).map((day: any) => {
    const costPerToken = day.totalCost / day.totalTokens;
    const tokenUtilization = day.events.reduce((sum: number, e: any) => 
      sum + (e.completion_tokens / e.tokens), 0) / day.events.length;
    const throughput = day.events.reduce((sum: number, e: any) => 
      sum + e.metadata.tokens_per_second, 0) / day.events.length;
    
    // Calculate optimization score (0-100)
    const optimizationScore = Math.min(100, Math.max(0,
      (tokenUtilization * 50) + // Weight token utilization
      ((1 - costPerToken / 0.0001) * 30) + // Weight cost efficiency
      (throughput / 100 * 20) // Weight performance
    ));

    return {
      timestamp: day.timestamp,
      costPerToken,
      tokenUtilization: tokenUtilization * 100,
      optimizationScore,
      totalCost: day.totalCost,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Cost Optimization</CardTitle>
        <CardDescription>
          Detailed cost efficiency and optimization metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={costData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatDate}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="cost"
                tickFormatter={(value) => `$${value.toFixed(4)}`}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="percentage"
                orientation="right"
                tickFormatter={(value) => `${value.toFixed(0)}%`}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                formatter={(value: number, name: string) => [
                  name === 'costPerToken' ? `$${value.toFixed(4)}` :
                  `${value.toFixed(1)}%`,
                  chartConfig[name as keyof typeof chartConfig]?.label || name
                ]}
              />
              <Bar
                yAxisId="cost"
                dataKey="costPerToken"
                fill={chartConfig.costEfficiency.color}
                fillOpacity={0.4}
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="percentage"
                type="monotone"
                dataKey="tokenUtilization"
                stroke={chartConfig.tokenUtilization.color}
                dot={false}
              />
              <Line
                yAxisId="percentage"
                type="monotone"
                dataKey="optimizationScore"
                stroke={chartConfig.optimizationScore.color}
                strokeDasharray="5 5"
                dot={false}
              />
              <Legend />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}