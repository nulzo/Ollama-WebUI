import { AnalyticsDashboard } from '@/features/analytics/components/analytics-dashboard';
import { Head } from '@/components/helmet';

export function AnalyticsRoute() {
  return (
    <>
      <Head title="Analytics" />
      <AnalyticsDashboard />
    </>
  );
}