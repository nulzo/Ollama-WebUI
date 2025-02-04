import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { AnalyticsData } from '../types/analytics';
import { ApiResponse } from '@/types/api';

export const getAnalytics = async (
  timeframe: 'day' | 'week' | 'month' | 'year' = 'week'
): Promise<ApiResponse<AnalyticsData>> => {
  const response = await api.get<ApiResponse<AnalyticsData>>(`/analytics/?timeframe=${timeframe}`);
  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to fetch analytics');
  }
  return response;
};

export const getAnalyticsQueryOptions = (timeframe: 'day' | 'week' | 'month' | 'year' = 'week') => ({
  queryKey: ['analytics', timeframe],
  queryFn: () => getAnalytics(timeframe),
});

export const useAnalytics = (timeframe: 'day' | 'week' | 'month' | 'year' = 'week') => {
  return useQuery(getAnalyticsQueryOptions(timeframe));
};