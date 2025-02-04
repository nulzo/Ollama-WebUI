import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/utils/format';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';

interface UsageOverviewProps {
  data?: Array<{
    timestamp: string;
    tokens: number;
    cost: number;
    messages: number;
  }>;
}

const chartConfig = {
  tokens: {
    label: "Tokens",
    color: "hsl(var(--chart-1))",
  },
  cost: {
    label: "Cost",
    color: "hsl(var(--chart-2))",
  },
  messages: {
    label: "Messages",
    color: "hsl(var(--chart-3))",
  }
};

export function UsageOverview({ data }: UsageOverviewProps) {
  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                {Object.entries(chartConfig).map(([key, config], index) => (
                  <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => formatDate(value)}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value.toLocaleString()}`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <ChartTooltip />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="tokens"
                stroke={chartConfig.tokens.color}
                fill={`url(#gradient-tokens)`}
                strokeWidth={2}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="cost"
                stroke={chartConfig.cost.color}
                fill={`url(#gradient-cost)`}
                strokeWidth={2}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="messages"
                stroke={chartConfig.messages.color}
                fill={`url(#gradient-messages)`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}