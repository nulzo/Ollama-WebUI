import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { AnalyticsData } from "../../types/analytics";

interface OverviewProps {
  data?: AnalyticsData;
}

export function Overview({ data }: OverviewProps) {
  if (!data) return null;

  // Combine data for overview
  const overviewData = data.tokenUsage.map((item, index) => ({
    timestamp: item.timestamp,
    tokens: item.count,
    messages: data.messageStats[index]?.sent || 0,
    cost: (item.count * 0.002) / 1000, // Example cost calculation
  }));

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={overviewData}>
        <XAxis
          dataKey="timestamp"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          yAxisId="left"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value.toLocaleString()}`}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value.toFixed(2)}`}
        />
        <Tooltip />
        <Bar dataKey="tokens" fill="#8884d8" yAxisId="left" />
        <Bar dataKey="messages" fill="#82ca9d" yAxisId="left" />
        <Bar dataKey="cost" fill="#ffc658" yAxisId="right" />
      </BarChart>
    </ResponsiveContainer>
  );
}