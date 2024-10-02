import { useQuery } from '@tanstack/react-query';
import { getAssistants } from '../api/get-assistants';
import { Assistant } from '../types/assistant';

export const useAssistants = () => {
  const {
    data: assistants,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['assistants'],
    queryFn: getAssistants,
  });

  const getAssistantIdByName = (name: string) => {
    return assistants?.find((assistant: Assistant) => assistant.name === name)?.id;
  };

  const getAssistantByName = (name: string): Assistant | undefined => {
    return assistants?.find(assistant => assistant.name === name);
  };

  return { assistants, isLoading, error, getAssistantIdByName, getAssistantByName };
};
