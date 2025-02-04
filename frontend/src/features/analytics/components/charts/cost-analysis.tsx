import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { formatCurrency, formatDate } from '@/lib/utils';

interface CostAnalysisProps {
  data?: Array<{
    timestamp: string;
    model: string;
    cost: number;
  }>;
}

// Color palette for different models
const colors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
];

export function CostAnalysis({ data }: CostAnalysisProps) {
  if (!data) return null;

  // Get unique models from the data
  const uniqueModels = Array.from(new Set(data.map(item => 
    item.model.toLowerCase().replace(/[.-]/g, '')
  )));

  // Create dynamic chart config based on unique models
  const chartConfig = uniqueModels.reduce((acc, model, index) => ({
    ...acc,
    [model]: {
      label: model.toUpperCase(),
      color: colors[index % colors.length],
    }
  }), {} as Record<string, { label: string; color: string; }>);

  // Process the data to group by timestamp and split costs by model
  const processedData = data.reduce((acc, item) => {
    const existingEntry = acc.find(entry => entry.timestamp === item.timestamp);
    const modelKey = item.model.toLowerCase().replace(/[.-]/g, '');
    
    if (existingEntry) {
      existingEntry.costs = {
        ...existingEntry.costs,
        [modelKey]: (existingEntry.costs[modelKey] || 0) + item.cost
      };
    } else {
      acc.push({
        timestamp: item.timestamp,
        costs: {
          [modelKey]: item.cost
        }
      });
    }
    return acc;
  }, [] as Array<{ timestamp: string; costs: Record<string, number> }>);

  const totalCost = data.reduce((acc, item) => acc + (item.cost || 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost Analysis</CardTitle>
        <CardDescription>
          Total Cost: {formatCurrency(totalCost)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatDate}
                fontSize={12}
              />
              <YAxis
                tickFormatter={(value) => formatCurrency(value)}
                fontSize={12}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload) return null;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="font-semibold">{formatDate(label)}</div>
                      <div className="grid gap-2 pt-2">
                        {payload.map((entry: any) => {
                          const modelConfig = chartConfig[entry.name.replace('costs.', '')];
                          return (
                            <div key={entry.name} className="flex items-center gap-2">
                              <div
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: modelConfig?.color }}
                              />
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                {modelConfig?.label || entry.name}
                              </span>
                              <span className="font-bold">
                                {formatCurrency(entry.value)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }}
              />
              <Legend />
              {uniqueModels.map((model, index) => (
                <Bar
                  key={model}
                  dataKey={`costs.${model}`}
                  stackId="costs"
                  fill={chartConfig[model].color}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}