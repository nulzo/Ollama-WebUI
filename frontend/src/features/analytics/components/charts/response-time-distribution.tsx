import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { formatNumber } from '@/lib/utils';
import { RawEvent } from '../../types/analytics';

interface ResponseTimeDistributionProps {
    rawEvents: RawEvent[];
}


const chartConfig = {
  distribution: {
    label: "Response Time Distribution",
    color: "hsl(var(--chart-1))",
  },
  average: {
    label: "Average Time",
    color: "hsl(var(--chart-2))",
  },
} as const;

export function ResponseTimeDistribution({ rawEvents }: ResponseTimeDistributionProps) {
  // Create time buckets (0-0.5s, 0.5-1s, 1-2s, 2-3s, 3-5s, 5s+)
  const timeBuckets = [
    { range: '0-0.5s', min: 0, max: 0.5 },
    { range: '0.5-1s', min: 0.5, max: 1 },
    { range: '1-2s', min: 1, max: 2 },
    { range: '2-3s', min: 2, max: 3 },
    { range: '3-5s', min: 3, max: 5 },
    { range: '5s+', min: 5, max: Infinity },
  ];

  // Calculate distribution
  const distribution = timeBuckets.map(bucket => {
    const count = rawEvents.filter(event => 
      event.metadata.generation_time >= bucket.min && 
      event.metadata.generation_time < bucket.max
    ).length;

    

    return {
      range: bucket.range,
      count,
      percentage: (count / rawEvents.length) * 100,
    };
  });

  // Calculate average response time
  const avgResponseTime = rawEvents.reduce((acc, event) => 
    acc + event.metadata.generation_time, 0) / rawEvents.length;


  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Time Distribution</CardTitle>
        <CardDescription>
          Average response time: {avgResponseTime.toFixed(2)}s
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            data={distribution}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="range"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(value) => `${value.toFixed(0)}%`}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              formatter={(value: number, name: string) => [
                `${value.toFixed(1)}%`,
                name === 'percentage' ? 'Requests' : name
              ]}
            />
            <Bar
              dataKey="percentage"
              fill={chartConfig.distribution.color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}