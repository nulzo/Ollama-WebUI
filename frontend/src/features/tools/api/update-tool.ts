import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';
import { Tool } from '@/features/tools/types/tool';
import { CreateToolInput } from '@/features/tools/api/create-tool';
import { getToolsQueryOptions } from '@/features/tools/api/get-tools';

export type UpdateToolInput = Partial<CreateToolInput>;

export const updateTool = ({
  toolId,
  data,
}: {
  toolId: string;
  data: UpdateToolInput;
}): Promise<Tool> => {
  return api.patch(`/tools/${toolId}/`, data);
};

type UseUpdateToolOptions = {
  mutationConfig?: MutationConfig<typeof updateTool>;
};

export const useUpdateTool = ({ mutationConfig }: UseUpdateToolOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: (_, { toolId }) => {
      queryClient.invalidateQueries({ queryKey: getToolsQueryOptions().queryKey });
      queryClient.invalidateQueries({ queryKey: ['tools', toolId] });
    },
    ...mutationConfig,
    mutationFn: updateTool,
  });
};