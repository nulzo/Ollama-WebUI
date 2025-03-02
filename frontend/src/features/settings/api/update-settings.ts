import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';
import { getSettingsQueryOptions } from './get-settings';

export const updateProviderSettingsSchema = z.object({
  provider_type: z.string().max(50).optional(),
  api_key: z.string().max(255).optional(),
  endpoint: z.string().max(255).optional(),
  organization_id: z.string().max(255).optional(),
  is_enabled: z.boolean().optional(),
});

export const updateSettingsSchema = z.object({
  theme: z.string().max(30).optional(),
  default_model: z.string().max(50).optional(),
  inline_citations_enabled: z.boolean().optional(),
});
export type UpdateProviderSettingsInput = z.infer<typeof updateProviderSettingsSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;

export const updateProviderSettings = ({
  data,
  provider_id,
}: {
  data: UpdateProviderSettingsInput;
  provider_id: string;
}): Promise<any> => {
  return api.patch(`/providers/${provider_id}/`, data);
};

export const updateSettings = ({
  data,
}: {
  data: UpdateSettingsInput;
}): Promise<any> => {
  return api.patch(`users/update_settings/`, data);
};
type UseUpdateProviderSettingsOptions = {
  mutationConfig?: MutationConfig<typeof updateProviderSettings>;
};
type UseUpdateSettingsOptions = {
  mutationConfig?: MutationConfig<typeof updateSettings>;
};
export const useUpdateProviderSettings = ({
  mutationConfig,
}: UseUpdateProviderSettingsOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: ['providerSettings'] });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateProviderSettings,
  });
};

export const useUpdateSettings = ({ mutationConfig }: UseUpdateSettingsOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, ...args) => {
      queryClient.refetchQueries({
        queryKey: getSettingsQueryOptions().queryKey,
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: updateSettings,
  });
};
