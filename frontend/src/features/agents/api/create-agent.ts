import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/query';
import { Agent } from '@/features/agents/types/agent';
import { getAgentsQueryOptions } from './get-agents';

export const createAgentSchema = z.object({
  displayName: z.string().min(1, 'Required'),
  description: z.string().optional(),
  profilePicture: z.string().optional(),
  model: z.string().min(1, 'Required'),
  systemPrompt: z.string().optional(),
  enabled: z.boolean(),
  files: z.boolean(),
  functionCall: z.boolean(),
  vision: z.boolean(),
  maxOutput: z.number(),
  tokens: z.number(),
  numCtx: z.number(),
  lowVram: z.boolean(),
  embeddingOnly: z.boolean(),
  seed: z.number(),
  numPredict: z.number(),
  temperature: z.number(),
  topK: z.number(),
  topP: z.number(),
  tfsZ: z.number(),
  typicalP: z.number(),
  repeatLastN: z.number(),
  repeatPenalty: z.number(),
  presencePenalty: z.number(),
  frequencyPenalty: z.number(),
  penalizeNewline: z.boolean(),
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
