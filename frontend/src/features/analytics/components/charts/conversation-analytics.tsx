import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { formatNumber } from '@/lib/utils';
import { RawEvent } from '../../types/analytics';

interface ConversationAnalyticsProps {
  rawEvents: RawEvent[];
}

const chartConfig = {
  messages: {

    label: 'Messages',
    color: 'hsl(var(--chart-1))',
  },

  tokens: {
    label: 'Tokens',
    color: 'hsl(var(--chart-2))',
  },
} as const;

export function ConversationAnalytics({ rawEvents }: ConversationAnalyticsProps) {
  // Group by conversation
  const conversationData = Object.entries(
    rawEvents.reduce(
      (acc, event) => {
        const id = event.metadata.conversation_id;
        if (!acc[id]) {
          acc[id] = { messages: 0, tokens: 0, avgTime: 0 };
        }


        acc[id].messages++;
        acc[id].tokens += event.tokens;
        acc[id].avgTime += event.metadata.generation_time;
        return acc;


      },
      {} as Record<string, { messages: number; tokens: number; avgTime: number }>
    )
  ).map(([id, stats]) => ({
    id: id.slice(0, 8), // Truncate ID for display
    messages: stats.messages,
    tokens: stats.tokens,
    avgTime: stats.avgTime / stats.messages,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversation Analysis</CardTitle>
        <CardDescription>Messages and tokens per conversation</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={conversationData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="id" />
            <YAxis yAxisId="left" tickFormatter={formatNumber} />
            <YAxis yAxisId="right" orientation="right" tickFormatter={formatNumber} />
            <ChartTooltip />
            <Bar
              yAxisId="left"
              dataKey="messages"
              fill={chartConfig.messages.color}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="tokens"
              fill={chartConfig.tokens.color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
