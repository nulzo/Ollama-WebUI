import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { formatNumber, formatDate } from '@/lib/utils';
import { RawEvent } from '../../types/analytics';

interface ConversationFlowProps {
    rawEvents: RawEvent[];
}



const chartConfig = {
  flow: {
    label: "Message Flow",
    color: "hsl(var(--chart-1))",
  },
  response: {
    label: "Response Time",
    color: "hsl(var(--chart-2))",
  },
  engagement: {
    label: "User Engagement",
    color: "hsl(var(--chart-3))",
  },
} as const;

export function ConversationFlow({ rawEvents }: ConversationFlowProps) {
  // Process conversation flow metrics
  const conversationMetrics = rawEvents.reduce((acc, event) => {
    const convId = event.metadata.conversation_id;
    const timestamp = new Date(event.timestamp).getTime();
    


    if (!acc[convId]) {
      acc[convId] = {
        messages: [],
        firstMessage: timestamp,
      };
    }
    
    acc[convId].messages.push({
      timestamp,
      tokens: event.tokens,
      responseTime: event.metadata.generation_time,
    });
    


    return acc;
  }, {} as Record<string, { messages: any[]; firstMessage: number; }>);

  // Calculate flow metrics
  const flowData = Object.values(conversationMetrics).map(conv => {
    const duration = (conv.messages[conv.messages.length - 1].timestamp - conv.firstMessage) / 1000; // in seconds
    const messageRate = conv.messages.length / (duration / 60); // messages per minute
    const avgResponseTime = conv.messages.reduce((sum, m) => sum + m.responseTime, 0) / conv.messages.length;
    const tokenDensity = conv.messages.reduce((sum, m) => sum + m.tokens, 0) / conv.messages.length;

    return {
      timestamp: new Date(conv.firstMessage).toISOString(),
      messageRate,
      avgResponseTime,
      tokenDensity,
    };
  }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversation Flow Analysis</CardTitle>
        <CardDescription>
          Message rate and response patterns over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={flowData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatDate}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="rate"
                tickFormatter={(value) => `${value.toFixed(1)}/min`}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="time"
                orientation="right"
                tickFormatter={(value) => `${value.toFixed(1)}s`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload) return null;
                  return (
                    <div className="bg-background shadow-sm p-2 border rounded-lg">
                      <div className="font-semibold">{formatDate(label)}</div>
                      <div className="gap-2 grid pt-2">
                        {payload.map((entry: any) => (
                          <div key={entry.dataKey} className="flex items-center gap-2">
                            <div
                              className="rounded-full w-2 h-2"
                              style={{ backgroundColor: entry.stroke }}
                            />
                            <span className="text-[0.70rem] text-muted-foreground uppercase">
                              {chartConfig[entry.dataKey.split('_')[0] as keyof typeof chartConfig].label}
                            </span>
                            <span className="font-bold">
                              {entry.dataKey.includes('Rate') 
                                ? `${entry.value.toFixed(1)}/min`
                                : `${entry.value.toFixed(1)}s`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }}
              />
              <Line
                yAxisId="rate"
                type="monotone"
                dataKey="messageRate"
                stroke={chartConfig.flow.color}
                dot={false}
              />
              <Line
                yAxisId="time"
                type="monotone"
                dataKey="avgResponseTime"
                stroke={chartConfig.response.color}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}