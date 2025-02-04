import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';

interface HourlyActivityProps {
  data?: Array<{
    hour: number;
    count: number;
  }>;
}

const chartConfig = {
  activity: {
    label: "Messages",
    color: "hsl(var(--chart-1))",
  }
};

export function HourlyActivity({ data }: HourlyActivityProps) {
  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity by Hour</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis
                dataKey="hour"
                tickFormatter={(value) => `${value}:00`}
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
              <ChartTooltip />
              <Bar
                dataKey="count"
                fill={chartConfig.activity.color}
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