import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ZAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { RawEvent } from '../../types/analytics';

interface ModelPerformanceProps {
    rawEvents: RawEvent[];
}


const chartConfig = {
  performance: {
    label: "Performance",
    color: "hsl(var(--chart-1))",
  },
} as const;


export function ModelPerformance({ rawEvents }: ModelPerformanceProps) {
  const performanceData = rawEvents.map(event => ({
    model: event.model,
    tokens: event.tokens,
    speed: event.metadata.tokens_per_second,
    time: event.metadata.generation_time,
  }));


  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Performance</CardTitle>
        <CardDescription>
          Generation time vs tokens per second
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              name="Time"
              unit="s"
              tickFormatter={(value) => value.toFixed(1)}
            />
            <YAxis
              dataKey="speed"
              name="Speed"
              unit=" t/s"
              tickFormatter={(value) => value.toFixed(1)}
            />
            <ZAxis
              dataKey="tokens"
              range={[50, 400]}
              name="Tokens"
            />
            <ChartTooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter
              data={performanceData}
              fill={chartConfig.performance.color}
            />
          </ScatterChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}