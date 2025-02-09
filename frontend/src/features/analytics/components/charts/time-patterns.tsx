import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { formatNumber } from '@/lib/utils';

interface TimePatternsProps {
  timeAnalysis: Array<{
    hour: number;
    requests: number;
    tokens: number;
    cost: number;
  }>;
}

const chartConfig = {
  requests: {
    label: "Requests",
    color: "hsl(var(--chart-1))",
  },

  tokens: {
    label: "Tokens",
    color: "hsl(var(--chart-2))",
  },

} as const;

export function TimePatterns({ timeAnalysis }: TimePatternsProps) {
  const formattedData = timeAnalysis.map(item => ({
    ...item,
    hour: `${item.hour}:00`,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Patterns</CardTitle>
        <CardDescription>
          Requests and tokens by hour
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            data={formattedData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartConfig.requests.color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={chartConfig.requests.color} stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartConfig.tokens.color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={chartConfig.tokens.color} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="hour" />
            <YAxis yAxisId="left" tickFormatter={formatNumber} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={formatNumber} />
            <ChartTooltip />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="requests"
              stroke={chartConfig.requests.color}
              fillOpacity={1}
              fill="url(#colorRequests)"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="tokens"
              stroke={chartConfig.tokens.color}
              fillOpacity={1}
              fill="url(#colorTokens)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}