import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { ApiResponse } from '@/types/api';
import { AnalyticsResponse, transformAnalyticsResponse } from '../utils/utils';
import { AnalyticsData } from "../types/analytics";

export const getAnalytics = async (
  timeframe: 'day' | 'week' | 'month' | 'year' = 'week'
): Promise<AnalyticsData> => {
  const response = await api.get<ApiResponse<AnalyticsResponse>>(`/analytics/?timeframe=${timeframe}`);
  


  if (!response.success) {
    throw new Error(response.error?.message || 'Failed to fetch analytics');
  }

  // Transform the raw events into aggregated data
  return response.data;

};

export const getAnalyticsQueryOptions = (timeframe: 'day' | 'week' | 'month' | 'year' = 'week') => ({
  queryKey: ['analytics', timeframe],
  queryFn: () => getAnalytics(timeframe),
});

export const useAnalytics = (timeframe: 'day' | 'week' | 'month' | 'year' = 'week') => {
  return useQuery<AnalyticsData, Error>(getAnalyticsQueryOptions(timeframe));
};