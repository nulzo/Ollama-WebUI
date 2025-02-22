import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ZAxis, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { formatNumber, formatDate } from '@/lib/utils';
import { RawEvent } from '../../types/analytics';

interface ModelComparisonProps {
    rawEvents: RawEvent[];
}


const chartConfig = {
  performance: {
    label: "Model Performance",
    colors: [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
    ],
  },
} as const;

export function ModelComparison({ rawEvents }: ModelComparisonProps) {
  // Group and process data by model
  const modelData = rawEvents.reduce((acc, event) => {
    if (!acc[event.model]) {
      acc[event.model] = [];
    }

    acc[event.model].push({
      tokens: event.tokens,
      speed: event.metadata.tokens_per_second,
      time: event.metadata.generation_time,
      efficiency: event.completion_tokens / (event.prompt_tokens + event.completion_tokens),
    });


    return acc;
  }, {} as Record<string, any[]>);

  // Calculate averages for each model
  const modelAverages = Object.entries(modelData).map(([model, events]) => {
    const avgSpeed = events.reduce((sum, e) => sum + e.speed, 0) / events.length;
    const avgTime = events.reduce((sum, e) => sum + e.time, 0) / events.length;
    const avgEfficiency = events.reduce((sum, e) => sum + e.efficiency, 0) / events.length;
    
    return {
      model,
      avgSpeed,
      avgTime,
      avgEfficiency,
      totalTokens: events.reduce((sum, e) => sum + e.tokens, 0),
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Performance Comparison</CardTitle>
        <CardDescription>
          Speed vs Efficiency across models
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="avgSpeed"
                name="Speed"
                unit=" t/s"
                tickFormatter={(value) => value.toFixed(1)}
              />
              <YAxis
                dataKey="avgEfficiency"
                name="Efficiency"
                unit="%"
                tickFormatter={(value) => (value * 100).toFixed(0)}
              />
              <ZAxis
                dataKey="totalTokens"
                range={[50, 400]}
                name="Total Tokens"
              />
              <ChartTooltip
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value: number, name: string) => [
                  name === 'Speed' ? `${value.toFixed(1)} t/s` :
                  name === 'Efficiency' ? `${(value * 100).toFixed(1)}%` :
                  formatNumber(value),
                  name
                ]}
              />
              <Legend />
              {modelAverages.map((model, index) => (
                <Scatter
                  key={model.model}
                  name={model.model}
                  data={[model]}
                  fill={chartConfig.performance.colors[index % chartConfig.performance.colors.length]}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}