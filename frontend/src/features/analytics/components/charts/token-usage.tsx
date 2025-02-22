import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TokenUsageChartProps {
  data: Array<{
    timestamp: string;
    tokens: number;
    messages: number;
    cost: number;
  }>;
}

const chartConfig = {
  usage: {
    label: "Usage",
  },
  tokens: {
    label: "Tokens Used",
    color: "hsl(var(--chart-1))",
  },
  messages: {
    label: "Messages Sent",
    color: "hsl(var(--chart-2))",
  },
  cost: {
    label: "Cost ($)",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

function aggregateData(data: TokenUsageChartProps['data'], timeRange: string) {
  const aggregatedData = new Map<string, { tokens: number; messages: number; cost: number }>();
  
  data.forEach(item => {
    const date = new Date(item.timestamp);
    let key: string;

    switch (timeRange) {
      case "1h":
        // 5-minute intervals
        const minutes = date.getMinutes();
        const roundedMinutes = Math.floor(minutes / 5) * 5;
        date.setMinutes(roundedMinutes);
        key = date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
        break;
      case "24h":
        // Hourly aggregation
        key = date.toISOString().slice(0, 13); // YYYY-MM-DDTHH
        break;
      case "7d":
        // Daily aggregation
        key = date.toISOString().slice(0, 10); // YYYY-MM-DD
        break;
      case "30d":
        // Every other day
        const dayOfMonth = date.getDate();
        key = dayOfMonth % 2 === 0 ? date.toISOString().slice(0, 10) : "";
        if (!key) return;
        break;
      case "90d":
        // Biweekly
        const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
        key = dayOfYear % 14 === 0 ? date.toISOString().slice(0, 10) : "";
        if (!key) return;
        break;
      default:
        key = date.toISOString().slice(0, 10);
    }

    if (!aggregatedData.has(key)) {
      aggregatedData.set(key, { tokens: 0, messages: 0, cost: 0 });
    }

    const current = aggregatedData.get(key)!;
    current.tokens += item.tokens;
    current.messages += item.messages;
    current.cost += item.cost;
  });

  return Array.from(aggregatedData.entries())
    .map(([date, values]) => ({
      date,
      ...values
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function TokenUsageChart({ data }: TokenUsageChartProps) {
  const [timeRange, setTimeRange] = React.useState("90d")

  const filteredData = data
    .map(d => ({
      date: new Date(d.timestamp).toISOString().split('T')[0],
      tokens: d.tokens,
      messages: d.messages,
      cost: d.cost,
    }))
    .filter((item) => {
      const date = new Date(item.date)
      const referenceDate = new Date()
      let daysToSubtract = 90
      if (timeRange === "30d") {
        daysToSubtract = 30
      } else if (timeRange === "7d") {
        daysToSubtract = 7
      }
      const startDate = new Date(referenceDate)
      startDate.setDate(startDate.getDate() - daysToSubtract)
      return date >= startDate
    });

    const filteredAndAggregatedData = React.useMemo(() => {
      const now = new Date();
      const cutoff = new Date();
      
      switch (timeRange) {
        case "1h":
          cutoff.setHours(cutoff.getHours() - 1);
          break;
        case "24h":
          cutoff.setHours(cutoff.getHours() - 24);
          break;

        case "7d":
          cutoff.setDate(cutoff.getDate() - 7);
          break;
        case "30d":
          cutoff.setDate(cutoff.getDate() - 30);
          break;
        case "90d":
          cutoff.setDate(cutoff.getDate() - 90);
          break;
      }
  
      const filtered = data.filter(item => {
        const date = new Date(item.timestamp);
        return date >= cutoff && date <= now;
      });
  
      return aggregateData(filtered, timeRange);
    }, [data, timeRange]);

    const formatXAxis = (value: string) => {
      const date = new Date(value);
      switch (timeRange) {
        case "1h":
          return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
        case "24h":
          return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            hour12: true,
          });
        default:
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
      }
    }

  return (
    <Card>
      <CardHeader className="flex sm:flex-row items-center gap-2 space-y-0 py-5 border-b">
        <div className="flex-1 gap-1 grid text-center sm:text-left">
          <CardTitle>Usage Overview</CardTitle>
          <CardDescription>
            Token usage, messages sent, and costs over time
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="sm:ml-auto rounded-lg w-[160px]"
            aria-label="Select time range"
          >
            <SelectValue placeholder="Last 24 hours" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="1h" className="rounded-lg">
              Last hour
            </SelectItem>
            <SelectItem value="24h" className="rounded-lg">
              Last 24 hours
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pt-4 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="w-full h-[250px] aspect-auto"
        >
          <AreaChart data={filteredAndAggregatedData}>
            <defs>
              <linearGradient id="fillTokens" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-1))"
                  stopOpacity={0.1}
                />
              </linearGradient>

              <linearGradient id="fillMessages" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-2))"
                  stopOpacity={0.8}
                />

                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-2))"
                  stopOpacity={0.1}
                />

              </linearGradient>
              <linearGradient id="fillCost" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--chart-3))"
                  stopOpacity={0.8}
                />

                <stop
                  offset="95%"
                  stopColor="hsl(var(--chart-3))"
                  stopOpacity={0.1}
                />

              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={formatXAxis}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return timeRange === "1h" || timeRange === "24h"
                      ? date.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: timeRange === "1h" ? "2-digit" : undefined,
                          hour12: true,
                        })
                      : date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="cost"
              type="natural"
              fill="url(#fillCost)"
              stroke="hsl(var(--chart-3))"
              stackId="a"
            />
            <Area

              dataKey="messages"
              type="natural"
              fill="url(#fillMessages)"
              stroke="hsl(var(--chart-2))"
              stackId="a"
            />

            <Area
              dataKey="tokens"
              type="natural"
              fill="url(#fillTokens)"
              stroke="hsl(var(--chart-1))"
              stackId="a"
            />

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}