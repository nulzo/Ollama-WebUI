import { useState, useRef, useEffect } from 'react';
import { useAnalytics } from '../api/get-analytics';
import { Card } from '@/components/ui/card';
import { Head } from '@/components/helmet';
import { MessageSquare, DollarSign, Zap, Clock, Loader2, LineChart, PieChart, BarChart2, Banknote } from 'lucide-react';
import { StatsCard } from './stats-card';
import { TokenUsageChart } from './charts/token-usage';
import { MessageStatsChart } from './charts/message-stats';
import { ModelUsageChart } from './charts/model-usage';
import { ModelDistribution } from './charts/model-distribution';
import { CostAnalysis } from './charts/cost-analysis';
import { PeakUsageHeatmap } from './charts/peak-usage';
import { HourlyActivity } from './charts/time-activity';
import { UsageOverview } from './charts/usage-overview';


const tabs = [
  {
    name: 'Overview',
    icon: <LineChart className="size-4" />,
  },
  {
    name: 'Messages',
    icon: <BarChart2 className="size-4" />,
  },
  {
    name: 'Spending',
    icon: <Banknote className="size-4" />,
  },
  {
    name: 'Models',
    icon: <PieChart className="size-4" />,
  },
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
  
  const { data: analytics, isLoading } = useAnalytics(timeframe);

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
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        });
      }
    });
  }, []);

  if (isLoading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Tokens"
          value={analytics?.data.totalTokens.toLocaleString() || '0'}
          icon={<Zap className="h-4 w-4 text-muted-foreground" />}
          description="from last period"
        />
        <StatsCard
          title="Total Cost"
          value={`$${parseFloat(analytics?.data.totalCost || '0').toFixed(6)}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="from last period"
        />
        <StatsCard
          title="Messages"
          value={analytics?.data.totalMessages.toLocaleString() || '0'}
          icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
          description="from last period"
        />
        <StatsCard
          title="Avg. Response Time"
          value={`${analytics?.data.averageResponseTime.toFixed(2)}s`}
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          description="from last period"
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
      <UsageOverview data={analytics?.data.tokenUsage} />
      <CostAnalysis data={analytics?.data.tokenUsage} />
    </div>
    <div>
      <PeakUsageHeatmap data={analytics?.data.timeAnalysis} />
    </div>
    </div>
  );

  const renderMessages = () => (
    <div className="space-y-6">
      <MessageStatsChart data={analytics?.data.messageStats} />
      <div className="grid gap-6 md:grid-cols-2">
        <HourlyActivity 
          data={analytics?.data.timeAnalysis.map(item => ({
            hour: item.hour,
            count: item.requests
          }))} 
        />
        <TokenUsageChart data={analytics?.data.tokenUsage} />
      </div>
    </div>
  );

  const renderModels = () => (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <ModelDistribution data={analytics?.data.modelUsage} />
        <div className="grid gap-4">
          <StatsCard
            title="Most Used Model"
            value={analytics?.data.modelUsage.sort((a, b) => b.tokens - a.tokens)[0]?.model || 'N/A'}
            icon={<Zap className="h-4 w-4 text-muted-foreground" />}
          />
          <StatsCard
            title="Lowest Error Rate"
            value={`${(analytics?.data.modelUsage.sort((a, b) => a.errorRate - b.errorRate)[0]?.errorRate || 0).toFixed(2)}%`}
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
      </div>
      <TokenUsageChart data={analytics?.data.tokenUsage} />
    </div>
  );

  const renderActiveContent = () => {
    switch (activeIndex) {
      case 0:
        return renderOverview();
      case 1:
        return renderMessages();
      case 2:
        return <></>;
      case 3:
        return renderModels();
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto py-6">
          <Head title="Analytics" description="Monitor your AI usage and performance" />

          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold">Analytics</h1>
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
              {/* Hover Highlight */}
              <div
                className="absolute h-[30px] transition-all duration-300 ease-out bg-secondary rounded-[6px] flex items-center"
                style={{
                  ...hoverStyle,
                  opacity: hoveredIndex !== null ? 1 : 0,
                }}
              />

              {/* Active Indicator */}
              <div
                className="absolute bottom-[-6px] h-[2px] bg-primary transition-all duration-300 ease-out rounded-full"
                style={activeStyle}
              />

              {/* Tab Buttons */}
              <div className="relative flex space-x-[6px] items-center">
                {tabs.map((tab, index) => (
                  <div
                    key={index}
                    ref={el => (tabRefs.current[index] = el)}
                    className={`px-3 py-2 cursor-pointer transition-colors duration-300 h-[30px] ${
                      index === activeIndex ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setActiveIndex(index)}
                  >
                    <div className="text-sm font-medium leading-5 whitespace-nowrap flex items-center justify-center h-full gap-2">
                      {tab.icon}
                      {tab.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {renderActiveContent()}
          </div>
        </div>
      </div>
    </div>
  );
}