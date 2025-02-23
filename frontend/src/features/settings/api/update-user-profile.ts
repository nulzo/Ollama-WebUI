import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';

export const updateUserProfileSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  full_name: z.string().optional(),
  description: z.string().optional(),
  avatar: z.string().optional(),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;

export const updateUserProfile = ({
  data,
}: {
  data: UpdateUserProfileInput;
}): Promise<any> => {
  return api.patch(`users/update_profile/`, data);
};

type UseUpdateUserProfileOptions = {
  mutationConfig?: MutationConfig<typeof updateUserProfile>;
};

export const useUpdateUserProfile = ({
  mutationConfig,
}: UseUpdateUserProfileOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
  });
};