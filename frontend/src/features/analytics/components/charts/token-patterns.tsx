import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { formatNumber, formatDate } from '@/lib/utils';
import { RawEvent } from '../../types/analytics';

interface TokenPatternsProps {
    rawEvents: RawEvent[];
}


const chartConfig = {
  promptRatio: {
    label: 'Prompt Ratio',
    color: 'hsl(var(--chart-1))',
  },
  completionRatio: {
    label: 'Completion Ratio',
    color: 'hsl(var(--chart-2))',
  },
  efficiency: {
    label: 'Token Efficiency',
    color: 'hsl(var(--chart-3))',
  },
} as const;

export function TokenPatterns({ rawEvents }: TokenPatternsProps) {
  // Process token patterns
  const patterns = rawEvents.reduce(
    (acc, event) => {
      const date = event.timestamp.split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          timestamp: date,
          total_tokens: 0,
          prompt_tokens: 0,
          completion_tokens: 0,
          conversations: new Set(),
        };
      }

      acc[date].total_tokens += event.tokens;
      acc[date].prompt_tokens += event.prompt_tokens;
      acc[date].completion_tokens += event.completion_tokens;
      acc[date].conversations.add(event.metadata.conversation_id);

      return acc;
    },
    {} as Record<string, any>
  );

  // Calculate metrics
  const patternData = Object.values(patterns).map((day: any) => ({
    timestamp: day.timestamp,
    promptRatio: (day.prompt_tokens / day.total_tokens) * 100,
    completionRatio: (day.completion_tokens / day.total_tokens) * 100,
    efficiency: day.completion_tokens / day.prompt_tokens,
    totalTokens: day.total_tokens,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Utilization Patterns</CardTitle>
        <CardDescription>Analysis of token distribution and efficiency</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ComposedChart data={patternData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatDate}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="ratio"
              tickFormatter={value => `${value.toFixed(0)}%`}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="efficiency"
              orientation="right"
              tickFormatter={value => value.toFixed(2)}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              formatter={(value: number, name: string) => [
                name === 'efficiency' ? value.toFixed(2) : `${value.toFixed(1)}%`,
                chartConfig[name as keyof typeof chartConfig].label,
              ]}
            />
            <Bar
              yAxisId="ratio"
              dataKey="promptRatio"
              fill={chartConfig.promptRatio.color}
              radius={[4, 4, 0, 0]}
              stackId="ratio"
            />
            <Bar
              yAxisId="ratio"
              dataKey="completionRatio"
              fill={chartConfig.completionRatio.color}
              radius={[4, 4, 0, 0]}
              stackId="ratio"
            />
            <Line
              yAxisId="efficiency"
              type="monotone"
              dataKey="efficiency"
              stroke={chartConfig.efficiency.color}
              dot={false}
            />
            <Legend />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
