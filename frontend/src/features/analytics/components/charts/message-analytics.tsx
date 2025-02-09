import { AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { formatNumber, formatDate } from '@/lib/utils';
import { RawEvent } from '../../types/analytics';

interface MessageAnalyticsProps {
    rawEvents: RawEvent[];
}


const tokenChartConfig = {
  prompt_tokens: {
    label: 'Prompt Tokens',
    color: 'var(--chart-1)',
  },
  completion_tokens: {
    label: 'Completion Tokens',
    color: 'var(--chart-2)',
  },
} as const;

const performanceChartConfig = {
  generation_time: {
    label: 'Generation Time',
    color: 'var(--chart-1)',
  },
  tokens_per_second: {
    label: 'Tokens/Second',
    color: 'var(--chart-2)',
  },
} as const;

export function MessageAnalytics({ rawEvents }: MessageAnalyticsProps) {
  // Group messages by conversation
  const conversationStats = rawEvents.reduce(
    (acc, event) => {
      const convId = event.metadata.conversation_id;
      if (!acc[convId]) {
        acc[convId] = {
          messages: 0,
          total_tokens: 0,
          avg_generation_time: 0,
          models: new Set(),


        };
      }
      acc[convId].messages++;
      acc[convId].total_tokens += event.tokens;
      acc[convId].avg_generation_time += event.metadata.generation_time;
      acc[convId].models.add(event.model);
      return acc;


    },
    {} as Record<string, any>
  );

  // Calculate averages
  const avgTokensPerMessage =
    rawEvents.reduce((acc, event) => acc + event.tokens, 0) / rawEvents.length;



  const avgGenerationTime =
    rawEvents.reduce((acc, event) => acc + event.metadata.generation_time, 0) / rawEvents.length;



  return (
    <div className="gap-4 grid md:grid-cols-2">
      {/* Token Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Token Distribution</CardTitle>
          <CardDescription>
            Avg {formatNumber(avgTokensPerMessage)} tokens per message
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={tokenChartConfig}>
            <AreaChart data={rawEvents} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatDate}
                tickLine={false}
                axisLine={false}
              />
              <YAxis tickFormatter={formatNumber} tickLine={false} axisLine={false} />
              <ChartTooltip />
              <Area
                type="monotone"
                dataKey="prompt_tokens"
                stackId="1"
                stroke={tokenChartConfig.prompt_tokens.color}
                fill={tokenChartConfig.prompt_tokens.color}
                fillOpacity={0.4}
              />
              <Area
                type="monotone"
                dataKey="completion_tokens"
                stackId="1"
                stroke={tokenChartConfig.completion_tokens.color}
                fill={tokenChartConfig.completion_tokens.color}
                fillOpacity={0.4}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Performance Metrics Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Generation Performance</CardTitle>
          <CardDescription>Avg {avgGenerationTime.toFixed(2)}s generation time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={performanceChartConfig}>
            <BarChart data={rawEvents} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatDate}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={value => `${value.toFixed(1)}s`}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip />
              <Bar
                dataKey="metadata.generation_time"
                fill={performanceChartConfig.generation_time.color}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="metadata.tokens_per_second"
                fill={performanceChartConfig.tokens_per_second.color}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
