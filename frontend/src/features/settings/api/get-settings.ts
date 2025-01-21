import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/query.ts';
import { Meta } from '@/types/api.ts';
import { ProviderSettings, UserSettings } from '@/features/settings/types/settings';

export const getSettings = (): Promise<{
  settings: UserSettings;
  meta: Meta;
}> => {
  return api.get(`users/profile/`);
};

export const getSettingsQueryOptions = () => {
  return queryOptions({
    queryKey: ['settings'],
    queryFn: () => getSettings(),
    staleTime: 60 * 1000 * 5,
    refetchInterval: 60 * 1000 * 5,
  });
};

type UseSettingsOptions = {
  queryConfig?: QueryConfig<typeof getSettings>;
};

export const useSettings = ({ queryConfig }: UseSettingsOptions = {}) => {
  return useQuery({
    ...getSettingsQueryOptions(),
    ...queryConfig,
  });
};

export const getProviderSettings = (): Promise<{
  providers: ProviderSettings[];
  meta: Meta;
}> => {
  return api.get(`/providers/`);
};

export const getProviderSettingsQueryOptions = () => {
  return queryOptions({
    queryKey: ['providers'],
    queryFn: () => getProviderSettings(),
    staleTime: 60 * 1000 * 5,
    refetchInterval: 60 * 1000 * 5,
  });
};

type UseProviderSettingsOptions = {
  queryConfig?: QueryConfig<typeof getProviderSettings>;
};

export const useProviderSettings = ({ queryConfig }: UseProviderSettingsOptions = {}) => {
  return useQuery({
    ...getProviderSettingsQueryOptions(),
    ...queryConfig,
  });
};
