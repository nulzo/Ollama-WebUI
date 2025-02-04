import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';
import { Agent } from '@/features/agents/types/agent';
import { getAgentsQueryOptions } from './get-agents';

export const createAgentSchema = z.object({
  display_name: z.string().min(1, 'Required'),
  description: z.string().optional(),
  icon: z.string().optional(),
  model: z.string().min(1, 'Required'),
  system_prompt: z.string().optional(),
  enabled: z.boolean(),
  files: z.boolean(),
  function_call: z.boolean(),
  vision: z.boolean(),
  max_output: z.number(),
  tokens: z.number(),
  num_ctx: z.number(),
  low_vram: z.boolean(),
  embedding_only: z.boolean(),
  seed: z.number(),
  num_predict: z.number(),
  temperature: z.number(),
  top_k: z.number(),
  top_p: z.number(),
  tfs_z: z.number(),
  typical_p: z.number(),
  repeat_last_n: z.number(),
  repeat_penalty: z.number(),
  presence_penalty: z.number(),
  frequency_penalty: z.number(),
  penalize_newline: z.boolean(),
  stop: z.array(z.string()),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;

export const createAgent = ({ data }: { data: CreateAgentInput }): Promise<Agent> => {
  return api.post('/agents/', data);
};

type UseCreateAgentOptions = {
  mutationConfig?: MutationConfig<typeof createAgent>;
};

export const useCreateAgent = ({ mutationConfig }: UseCreateAgentOptions = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getAgentsQueryOptions().queryKey });
    },
    ...mutationConfig,
    mutationFn: createAgent,
  });
};
