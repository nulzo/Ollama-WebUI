import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Assistant } from '@/features/assistant/types/assistant';

export const getAssistants = (): Promise<Assistant[]> => {
  return api.get('/assistant/');
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

export const getPaginatedAssistants = (
  page: number = 1,
  pageSize: number = 10
): Promise<{ data: Assistant[]; total: number; page: number; pageSize: number }> => {
  return api.get('/assistants/', {
    params: {
      page,
      page_size: pageSize,
    },
  });
};

export const getPaginatedAssistantsQueryOptions = (page: number, pageSize: number) => ({
  queryKey: ['assistants', 'paginated', page, pageSize],
  queryFn: () => getPaginatedAssistants(page, pageSize),
});

export const usePaginatedAssistants = (page: number, pageSize: number) => {
  return useQuery(getPaginatedAssistantsQueryOptions(page, pageSize));
};
