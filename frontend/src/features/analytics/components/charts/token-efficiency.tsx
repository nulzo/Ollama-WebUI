import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { formatNumber, formatDate } from '@/lib/utils';

interface TokenEfficiencyProps {
  rawEvents: Array<{
    timestamp: string;
    prompt_tokens: number;
    completion_tokens: number;
  }>;
}

const chartConfig = {
  ratio: {
    label: "Completion/Prompt Ratio",
    color: "hsl(var(--chart-1))",
  },
  efficiency: {
    label: "Token Efficiency",
    color: "hsl(var(--chart-2))",
  },
} as const;

export function TokenEfficiency({ rawEvents }: TokenEfficiencyProps) {
  const efficiencyData = rawEvents.map(event => ({
    timestamp: event.timestamp,
    ratio: event.completion_tokens / event.prompt_tokens,
    efficiency: (event.completion_tokens / (event.prompt_tokens + event.completion_tokens)) * 100,
  }));

  const avgRatio = efficiencyData.reduce((acc, item) => acc + item.ratio, 0) / efficiencyData.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Efficiency</CardTitle>
        <CardDescription>
          Average completion/prompt ratio: {avgRatio.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            data={efficiencyData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatDate}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              tickFormatter={(value) => `${value.toFixed(1)}x`}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(value) => `${value.toFixed(0)}%`}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="ratio"
              stroke={chartConfig.ratio.color}
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="efficiency"
              stroke={chartConfig.efficiency.color}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}