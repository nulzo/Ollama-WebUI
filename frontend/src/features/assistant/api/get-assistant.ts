import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Assistant } from '@/features/assistant/types/assistant';

export const getAssistants = (): Promise<Assistant[]> => {
  return api.get('/assistants/');
};

export const getAssistantsQueryOptions = () => ({
  queryKey: ['assistants'],
  queryFn: getAssistants,
});

export const useAssistants = () => {
  return useQuery(getAssistantsQueryOptions());
};

export const getAssistant = (assistantId: number): Promise<Assistant> => {
  return api.get(`/assistant/${assistantId}/`);
};

export const getAssistantQueryOptions = (assistantId: number) => ({
  queryKey: ['assistants', assistantId],
  queryFn: () => getAssistant(assistantId),
});

export const useAssistant = (assistantId: number) => {
  return useQuery(getAssistantQueryOptions(assistantId));
};
