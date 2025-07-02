import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface ModelUsageChartProps {
  data?: Array<{
    model: string;
    tokens: number;
    cost: number;
  }>;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--muted))',
];

export function ModelUsageChart({ data }: ModelUsageChartProps) {
  if (!data) return null;

  const chartData = data.map(item => ({
    name: item.model,
    value: item.tokens,
    cost: item.cost,
  }));

  const chartConfig = {
    model: {
      label: 'Model',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <ChartContainer config={chartConfig}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip
                  formatter={(value: number, name: string) => [
                    `${value.toLocaleString()} tokens ($${(chartData.find(d => d.name === name)?.cost || 0).toFixed(2)})`,
                    name,
                  ]}
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--primary))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }}
                />
                <Legend />

              </PieChart>

            </ChartContainer>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
