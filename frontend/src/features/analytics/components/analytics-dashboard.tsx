import { useState, useRef, useEffect } from 'react';
import { useAnalytics } from '../api/get-analytics';
import { Card } from '@/components/ui/card';
import { Head } from '@/components/helmet';
import {
  LineChart,
  BarChart2,
  PieChart,
  Banknote,
  Loader2,
} from 'lucide-react';

import { StatsCard } from './stats-card';
import { TokenUsageChart } from './charts/token-usage';
import { MessageStatsChart } from './charts/message-stats';
import { ModelUsageChart } from './charts/model-usage';
import { ModelDistribution } from './charts/model-distribution';
import { CostAnalysis } from './charts/cost-analysis';
import { PeakUsageHeatmap } from './charts/peak-usage';
import { HourlyActivity } from './charts/time-activity';
import { UsageOverview } from './charts/usage-overview';
import { MessageAnalytics } from './charts/message-analytics';
import { TimePatterns } from './charts/time-patterns';
import { ModelPerformance } from './charts/model-performance';
import { ConversationAnalytics } from './charts/conversation-analytics';
import { TokenEfficiency } from './charts/token-efficiency';
import { ModelComparison } from './charts/model-comparison';
import { CostOptimization } from './charts/cost-optimization';
import { ConversationFlow } from './charts/conversation-flow';
import { ResponseTimeDistribution } from './charts/response-time-distribution';
import { TokenPatterns } from './charts/token-patterns';
import { AdvancedCostInsights } from './charts/advanced-cost-insights';

const tabs = [
  { name: 'Overview', icon: <LineChart className="size-4" /> },
  { name: 'Messages', icon: <BarChart2 className="size-4" /> },
  { name: 'Spending', icon: <Banknote className="size-4" /> },
  { name: 'Models', icon: <PieChart className="size-4" /> },
];

const timeframes = [
  { value: 'day', label: '24h' },
  { value: 'week', label: '7d' },
  { value: 'month', label: '30d' },
  { value: 'year', label: '1y' },
] as const;

export function AnalyticsDashboard() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverStyle, setHoverStyle] = useState({});
  const [activeStyle, setActiveStyle] = useState({ left: '0px', width: '0px' });
  const tabRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [timeframe, setTimeframe] = useState<typeof timeframes[number]['value']>('week');

  // useAnalytics now returns AggregatedAnalyticsData.
  const { data: analytics, isLoading, error } = useAnalytics(timeframe);

  useEffect(() => {
    if (hoveredIndex !== null) {
      const hoveredElement = tabRefs.current[hoveredIndex];
      if (hoveredElement) {
        const { offsetLeft, offsetWidth } = hoveredElement;
        setHoverStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    }
  }, [hoveredIndex]);

  useEffect(() => {
    const activeElement = tabRefs.current[activeIndex];
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement;
      setActiveStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      });
    }
  }, [activeIndex]);

  useEffect(() => {
    requestAnimationFrame(() => {
      const firstElement = tabRefs.current[0];
      if (firstElement) {
        const { offsetLeft, offsetWidth } = firstElement;
        setActiveStyle({ left: `${offsetLeft}px`, width: `${offsetWidth}px` });
      }
    });
  }, []);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );

  console.log(analytics);

  if (!analytics) return <div>No data</div>;


  if (error) return <div>Error: {error.message}</div>;

  // Now you can use analytics.totalTokens etc.

  const renderOverview = () => (
    <>
      <StatsCard title="Total Tokens" value={analytics.totalTokens} />
      <StatsCard title="Total Cost" value={`$${analytics.totalCost}`} />
      {/* <UsageOverview data={analytics.usageOverview} /> */}
      <TokenUsageChart data={analytics.usageOverview} />
      <TokenPatterns rawEvents={analytics.rawEvents} />
    </>
  );


  const renderMessages = () => (
    <>
      <MessageStatsChart data={analytics.messageStats} />
      <ConversationAnalytics rawEvents={analytics.rawEvents} />
      <ModelPerformance rawEvents={analytics.rawEvents} />
      <TimePatterns timeAnalysis={analytics.timeAnalysis} />
      <MessageAnalytics rawEvents={analytics.rawEvents} />
      <PeakUsageHeatmap data={analytics.rawEvents} />
      <TokenEfficiency rawEvents={analytics.rawEvents} />
      <HourlyActivity data={analytics.timeAnalysis} />
      <ConversationFlow rawEvents={analytics.rawEvents} />
      <ResponseTimeDistribution rawEvents={analytics.rawEvents} />

    </>
  );

  const renderModels = () => (

    <>
      <ModelUsageChart data={analytics.modelUsage} />
      <ModelComparison rawEvents={analytics.rawEvents} />
      <ModelDistribution data={analytics.modelUsage} />
    </>
  );

  const renderSpending = () => (
    <>
      <CostOptimization rawEvents={analytics.rawEvents} />
      <CostAnalysis data={analytics.rawEvents.map(event => ({
          timestamp: event.timestamp,
          model: event.model,
          cost: event.cost,
        }))} />
      <AdvancedCostInsights rawEvents={analytics.rawEvents} />
    </>
  );


  const renderActiveContent = () => {

    switch (activeIndex) {
      case 0:
        return renderOverview();
      case 1:
        return renderMessages();
      case 2:
        return renderSpending();
      case 3:
        return renderModels();
      default:
        return null;
    }
  };

  return (
    <div className="flex w-full h-full overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="mx-auto py-6 container">
          <Head title="Analytics" description="Monitor your AI usage and performance" />
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="font-bold text-4xl">Analytics</h1>
              <p className="text-lg text-muted-foreground">
                Monitor your AI usage and performance metrics
              </p>
            </div>
            {/* Timeframe selector */}
            <Card className="flex space-x-1 p-1">
              {timeframes.map((tf) => (
                <button
                  key={tf.value}
                  onClick={() => setTimeframe(tf.value)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    timeframe === tf.value
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </Card>
          </div>
          {/* Tabs */}
          <div className="mb-8">
            <div className="relative">
              <div
                className="absolute flex items-center bg-secondary rounded-[6px] h-[30px] transition-all duration-300 ease-out"
                style={{
                  ...hoverStyle,
                  opacity: hoveredIndex !== null ? 1 : 0,
                }}
              />
              <div
                className="bottom-[-6px] absolute bg-primary rounded-full h-[2px] transition-all duration-300 ease-out"
                style={activeStyle}
              />
              <div className="relative flex items-center space-x-[6px]">
                {tabs.map((tab, index) => (
                  <div
                    key={index}
                    ref={(el) => (tabRefs.current[index] = el)}
                    className={`px-3 py-2 cursor-pointer transition-colors duration-300 h-[30px] ${
                      index === activeIndex ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setActiveIndex(index)}
                  >
                    <div className="flex justify-center items-center gap-2 h-full font-medium text-sm leading-5 whitespace-nowrap">
                      {tab.icon}
                      {tab.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Content */}
          <div className="space-y-6">{renderActiveContent()}</div>
        </div>
      </div>
    </div>
  );
}