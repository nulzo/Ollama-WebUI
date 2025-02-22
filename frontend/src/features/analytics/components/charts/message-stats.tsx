import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { TrendingUp, TrendingDown, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { formatNumber, formatDate } from '@/lib/utils';

interface MessageStatsChartProps {
  data: Array<{
    timestamp: string;
    sent: number;
    received: number;
  }>;
}

const chartConfig = {
  sent: {
    label: "Sent",
    color: "var(--chart-1)",
  },
  received: {
    label: "Received",
    color: "var(--chart-2)",
  },
} as const;

export function MessageStatsChart({ data }: MessageStatsChartProps) {
  // Calculate total messages (sent + received)
  const totalMessages = data.reduce((acc, item) => 
    acc + (item.sent || 0) + (item.received || 0), 0
  );

  const avgMessages = data.length > 0 
    ? Math.round(totalMessages / data.length)
    : 0;

  // Calculate trend (last 3 points)
  const lastThreePoints = data.slice(-3);
  const trend = lastThreePoints.length === 3 
    ? (lastThreePoints[2].sent + lastThreePoints[2].received) - 
      (lastThreePoints[0].sent + lastThreePoints[0].received)
    : 0;
  
  const trendPercentage = lastThreePoints.length === 3 && 
    (lastThreePoints[0].sent + lastThreePoints[0].received) !== 0
      ? ((trend / (lastThreePoints[0].sent + lastThreePoints[0].received)) * 100).toFixed(1)
      : "0.0";

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Message Activity</CardTitle>
            <CardDescription>
              {formatNumber(avgMessages)} messages per interval
            </CardDescription>
          </div>
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatDate}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => formatNumber(value)}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="bg-background shadow-sm p-2 border rounded-lg">
                    <div className="gap-2 grid">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[0.70rem] text-muted-foreground uppercase">
                          {formatDate(payload[0].payload.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-[var(--chart-1)] rounded-full w-2 h-2" />
                        <span className="text-[0.70rem] text-muted-foreground uppercase">
                          Sent
                        </span>
                        <span className="font-bold">
                          {formatNumber(payload[0].payload.sent)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-[var(--chart-2)] rounded-full w-2 h-2" />
                        <span className="text-[0.70rem] text-muted-foreground uppercase">
                          Received
                        </span>
                        <span className="font-bold">
                          {formatNumber(payload[0].payload.received)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="sent"
              fill="var(--color-sent)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
              stackId="a"
            />
            <Bar
              dataKey="received"
              fill="var(--color-received)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
              stackId="a"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="gap-4 grid w-full">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm leading-none">
              {trend >= 0 ? (
                <>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="font-medium">Up {trendPercentage}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span className="font-medium">Down {Math.abs(Number(trendPercentage))}%</span>
                </>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center text-muted-foreground text-sm">
            <div>Total messages: {formatNumber(totalMessages)}</div>
            <div>Avg per interval: {formatNumber(avgMessages)}</div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}