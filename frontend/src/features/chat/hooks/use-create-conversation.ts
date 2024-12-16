import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api-client.ts';

interface CreateConversationResponse {
  uuid: string;
}

export const useCreateConversation = () => {
  return useMutation<CreateConversationResponse, Error>(
    () => api.post('/conversations/').then(res => res.uuid),
    {
      onError: error => {
        console.error('Error creating conversation:', error);
      },
    }
  );
};
