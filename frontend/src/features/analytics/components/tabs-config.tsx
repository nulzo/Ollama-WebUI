import {
  LineChart,
  BarChart2,
  PieChart,
  Banknote,
} from 'lucide-react';
import { StatsCard } from '../components/stats-card';
import { TokenUsageChart } from '../components/charts/token-usage';
import { MessageStatsChart } from '../components/charts/message-stats';
import { ModelUsageChart } from '../components/charts/model-usage';
import { ModelDistribution } from '../components/charts/model-distribution';
import { CostAnalysis } from '../components/charts/cost-analysis';
import { PeakUsageHeatmap } from '../components/charts/peak-usage';
import { HourlyActivity } from '../components/charts/time-activity';
import { MessageAnalytics } from '../components/charts/message-analytics';
import { TimePatterns } from '../components/charts/time-patterns';
import { ModelPerformance } from '../components/charts/model-performance';
import { ConversationAnalytics } from '../components/charts/conversation-analytics';
import { TokenEfficiency } from '../components/charts/token-efficiency';
import { ModelComparison } from '../components/charts/model-comparison';
import { CostOptimization } from '../components/charts/cost-optimization';
import { ConversationFlow } from '../components/charts/conversation-flow';
import { ResponseTimeDistribution } from '../components/charts/response-time-distribution';
import { TokenPatterns } from '../components/charts/token-patterns';
import { AdvancedCostInsights } from '../components/charts/advanced-cost-insights';
import { AnalyticsData } from '../types/analytics';

export const tabsConfig = (analytics: AnalyticsData) => [
  {
    name: 'Overview',
    icon: <LineChart className="size-4" />,
    content: (
      <>
        <StatsCard title="Total Tokens" value={analytics.totalTokens} />
        <StatsCard title="Total Cost" value={`$${analytics.totalCost}`} />
        <TokenUsageChart data={analytics.usageOverview} />
        <TokenPatterns rawEvents={analytics.rawEvents} />
      </>
    ),
  },
  {
    name: 'Messages',
    icon: <BarChart2 className="size-4" />,
    content: (
      <>
        <MessageStatsChart data={analytics.messageStats} />
        <ConversationAnalytics rawEvents={analytics.rawEvents} />
        <ModelPerformance rawEvents={analytics.rawEvents} />
        <TimePatterns timeAnalysis={analytics.timeAnalysis} />
        <MessageAnalytics rawEvents={analytics.rawEvents} />
        <PeakUsageHeatmap data={analytics.rawEvents} />
        <TokenEfficiency rawEvents={analytics.rawEvents} />
        <HourlyActivity data={analytics.timeAnalysis.map(t => ({ hour: t.hour, count: t.requests }))} />
        <ConversationFlow rawEvents={analytics.rawEvents} />
        <ResponseTimeDistribution rawEvents={analytics.rawEvents} />
      </>
    ),
  },
  {
    name: 'Spending',
    icon: <Banknote className="size-4" />,
    content: (
      <>
        <CostOptimization rawEvents={analytics.rawEvents} />
        <CostAnalysis data={analytics.rawEvents.map(event => ({ timestamp: event.timestamp, model: event.model, cost: event.cost }))} />
        <AdvancedCostInsights rawEvents={analytics.rawEvents} />
      </>
    ),
  },
  {
    name: 'Models',
    icon: <PieChart className="size-4" />,
    content: (
      <>
        <ModelUsageChart data={analytics.modelUsage} />
        <ModelComparison rawEvents={analytics.rawEvents} />
        <ModelDistribution data={analytics.modelUsage} />
      </>
    ),
  },
]; 