import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { formatNumber } from '@/lib/utils';

interface MessageStatsChartProps {
  data?: Array<{
    sent: number;
    received: number;
    timestamp: string;
  }>;
}

const chartConfig = {
  sent: {
    label: "Sent",
    color: "hsl(var(--chart-1))",
  },
  received: {
    label: "Received",
    color: "hsl(var(--chart-2))",
  },
};

export function MessageStatsChart({ data }: MessageStatsChartProps) {
  if (!data) return null;

  // Group messages by hour for better visualization
  const groupedData = data.reduce((acc, item) => {
    const hour = new Date(item.timestamp).getHours();
    const existing = acc.find(x => x.hour === hour);
    
    if (existing) {
      existing.sent += item.sent;
      existing.received += item.received;
    } else {
      acc.push({ hour, sent: item.sent, received: item.received });
    }
    
    return acc;
  }, [] as Array<{ hour: number; sent: number; received: number }>);

  // Calculate response rate
  const totalSent = data.reduce((acc, item) => acc + item.sent, 0);
  const totalReceived = data.reduce((acc, item) => acc + item.received, 0);
  const responseRate = ((totalReceived / totalSent) * 100).toFixed(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Message Activity</CardTitle>
        <CardDescription className="flex flex-wrap gap-x-6 gap-y-2">
          <span>Messages Sent: {formatNumber(totalSent)}</span>
          <span>Messages Received: {formatNumber(totalReceived)}</span>
          <span>Response Rate: {responseRate}%</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={groupedData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              barGap={0}
            >
              <XAxis
                dataKey="hour"
                tickFormatter={(hour) => `${hour}:00`}
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
                cursor={{ fill: 'hsl(var(--muted)/0.1)' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                  padding: '12px',
                }}
                formatter={(value: number, name: string) => [
                  formatNumber(value),
                  chartConfig[name as keyof typeof chartConfig].label
                ]}
              />
              <Bar
                dataKey="sent"
                fill={chartConfig.sent.color}
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="received"
                fill={chartConfig.received.color}
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}