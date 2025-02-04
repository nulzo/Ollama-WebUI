import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatDate } from '@/utils/format';
import { ChartContainer } from '@/components/ui/chart';
import { formatNumber } from '@/lib/utils';

interface TokenUsageChartProps {
  data?: Array<{
    timestamp: string;
    count: number;
    model: string;
  }>;
}

const chartConfig = {
  count: {
    label: "Token Usage",
    color: "hsl(var(--chart-1))",
  },
};

export function TokenUsageChart({ data }: TokenUsageChartProps) {
  if (!data) return null;

  const totalTokens = data.reduce((acc, item) => acc + item.count, 0);
  const avgTokens = Math.round(totalTokens / data.length);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Usage Over Time</CardTitle>
        <CardDescription>
          Average Usage: {formatNumber(avgTokens)} tokens per period
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <defs>
                <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartConfig.count.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartConfig.count.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatDate}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatNumber}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: 'hsl(var(--border)) 0px 1px 3px 0px',
                }}
                labelFormatter={formatDate}
                formatter={(value: number) => [formatNumber(value), 'Tokens']}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke={chartConfig.count.color}
                fill="url(#tokenGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}