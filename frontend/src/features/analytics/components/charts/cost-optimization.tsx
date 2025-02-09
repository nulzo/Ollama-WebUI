import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { formatNumber, formatDate, formatCurrency } from '@/lib/utils';

interface CostOptimizationProps {
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
  costPerToken: {
    label: "Cost per Token",
    color: "hsl(var(--chart-1))",
  },
  efficiency: {
    label: "Token Efficiency",
    color: "hsl(var(--chart-2))",
  },
  trend: {
    label: "Cost Trend",
    color: "hsl(var(--chart-3))",
  },
} as const;

export function CostOptimization({ rawEvents }: CostOptimizationProps) {
  // Calculate cost metrics
  const costMetrics = rawEvents.map(event => {
    const totalTokens = event.prompt_tokens + event.completion_tokens;
    const costPerToken = event.cost / totalTokens;
    const efficiency = event.completion_tokens / totalTokens;
    
    return {
      timestamp: event.timestamp,
      costPerToken,
      efficiency,
      model: event.model,
      totalCost: event.cost,
      tokensPerDollar: totalTokens / event.cost,
    };
  });

  // Calculate moving averages for trend
  const windowSize = 5;
  const trendData = costMetrics.map((metric, index) => {
    const window = costMetrics.slice(Math.max(0, index - windowSize), index + 1);
    const avgCostPerToken = window.reduce((sum, m) => sum + m.costPerToken, 0) / window.length;
    
    return {
      ...metric,
      trendCost: avgCostPerToken,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Optimization Insights</CardTitle>
        <CardDescription>
          Cost efficiency and token utilization trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={trendData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <defs>
                <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartConfig.costPerToken.color} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={chartConfig.costPerToken.color} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
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
                yAxisId="efficiency"
                orientation="right"
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                formatter={(value: number, name: string) => [
                  name === 'costPerToken' ? `$${value.toFixed(4)}` :
                  name === 'efficiency' ? `${(value * 100).toFixed(1)}%` :
                  name === 'trendCost' ? `$${value.toFixed(4)}` :
                  formatNumber(value),
                  chartConfig[name as keyof typeof chartConfig]?.label || name
                ]}
              />
              <Area
                yAxisId="cost"
                type="monotone"
                dataKey="costPerToken"
                stroke={chartConfig.costPerToken.color}
                fill="url(#costGradient)"
              />
              <Line
                yAxisId="efficiency"
                type="monotone"
                dataKey="efficiency"
                stroke={chartConfig.efficiency.color}
                dot={false}
              />
              <Line
                yAxisId="cost"
                type="monotone"
                dataKey="trendCost"
                stroke={chartConfig.trend.color}
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