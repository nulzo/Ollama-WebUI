import { queryOptions, useQuery } from '@tanstack/react-query';
import { settingsService } from '@/services/storage/client';

export const getSettings = () => {
  return queryOptions({
    queryKey: ['messages'],
    queryFn: () => {
      return settingsService.fetchSettings();
    },
  });
};

export const useGetSettings = () => {
  return useQuery({
    ...getSettings(),
  });
};
