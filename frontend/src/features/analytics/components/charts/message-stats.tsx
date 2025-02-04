import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/utils/format';

interface MessageStatsChartProps {
  data?: Array<{
    timestamp: string;
    sent: number;
    received: number;
  }>;
}

export function MessageStatsChart({ data }: MessageStatsChartProps) {
  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Message Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              barGap={0}
            >
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => formatDate(value)}
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
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted)/0.1)' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
                labelFormatter={(value) => formatDate(value)}
                formatter={(value: number, name: string) => [
                  value.toLocaleString(),
                  name === 'sent' ? 'Sent Messages' : 'Received Messages'
                ]}
              />
              <Bar
                dataKey="sent"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
                name="Sent"
              />
              <Bar
                dataKey="received"
                fill="hsl(var(--primary)/0.3)"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
                name="Received"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}