import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { formatNumber } from '@/lib/utils';

interface ModelDistributionProps {
  data?: Array<{
    model: string;
    tokens: number;
    cost: number;
  }>;
}

const RADIAN = Math.PI / 180;
const chartConfig = {
  gpt4: {
    label: "GPT-4",
    color: "hsl(var(--chart-1))",
  },
  gpt35: {
    label: "GPT-3.5",
    color: "hsl(var(--chart-2))",
  },
  claude: {
    label: "Claude",
    color: "hsl(var(--chart-3))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-4))",
  },
};

const CustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  value,
  name,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const sin = Math.sin(-midAngle * RADIAN);
  const cos = Math.cos(-midAngle * RADIAN);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke="hsl(var(--primary))"
        fill="none"
      />
      <circle
        cx={ex}
        cy={ey}
        r={2}
        fill="hsl(var(--primary))"
        stroke="none"
      />
      <text

        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="hsl(var(--foreground))"
        className="text-xs"
      >{`${name} (${(percent * 100).toFixed(1)}%)`}</text>
    </g>
  );
};

export function ModelDistribution({ data }: ModelDistributionProps) {
  if (!data) return null;

  const totalTokens = data.reduce((acc, item) => acc + item.tokens, 0);
  const totalCost = data.reduce((acc, item) => acc + item.cost, 0);

  const chartData = data.map(item => ({
    name: item.model,
    value: item.tokens,
    cost: item.cost,
    percentage: (item.tokens / totalTokens) * 100
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Distribution</CardTitle>
        <CardDescription>
          Total Usage: {formatNumber(totalTokens)} tokens (${totalCost.toFixed(4)})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={Object.values(chartConfig)[index % Object.keys(chartConfig).length].color}
                    strokeWidth={2}
                    stroke="hsl(var(--foreground))"
                  />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                height={36}
                content={({ payload }) => (
                  <div className="flex justify-center gap-4 mt-4">
                    {payload?.map((entry: any, index: number) => (
                      <div key={`legend-${index}`} className="flex items-center gap-2">
                        <div
                          className="rounded-full w-3 h-3"
                          style={{ backgroundColor: entry.color }}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{entry.value}</span>
                          <span className="text-muted-foreground text-xs">
                            ${chartData[index].cost.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}