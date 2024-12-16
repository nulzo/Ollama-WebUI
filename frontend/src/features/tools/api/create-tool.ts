import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';
import { Tool } from '@/features/tools/types/tool';
import { getToolsQueryOptions } from './get-tools';

export const createToolSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  function_content: z.string().min(1, 'Function content is required'),
  language: z.enum(['python', 'javascript', 'typescript']),
  parameters: z.record(z.any()),
  returns: z.record(z.any()),
  docstring: z.string(),
  is_enabled: z.boolean().optional(),
});

export type CreateToolInput = z.infer<typeof createToolSchema>;

export const createTool = ({ data }: { data: CreateToolInput }): Promise<Tool> => {
  return api.post('/tools/', data);
};

type UseCreateToolOptions = {
  mutationConfig?: MutationConfig<typeof createTool>;
};

export const useCreateTool = ({ mutationConfig }: UseCreateToolOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getToolsQueryOptions().queryKey });
    },
    ...mutationConfig,
    mutationFn: createTool,
  });
};
