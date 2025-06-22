import { useCallback } from 'react';
import { useChatMutation } from './use-chat-mutation';
import { useModelStore } from '@/features/models/store/model-store';
import { toast } from '@/components/ui/use-toast';
import { useSearchParams } from 'react-router-dom';

export const useSubmitHandler = () => {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('c');
  const { mutate, isPending } = useChatMutation(conversationId || undefined);
  const model = useModelStore((state) => state.model);

  const handleSubmit = useCallback(
    (message: string, images?: string[], knowledgeIds?: string[], functionCall?: boolean) => {
      if (!model) {
        toast({
          title: 'No model selected',
          description: 'Please select a model to start a conversation.',
          variant: 'destructive',
        });
        return;
      }

      mutate({
        message,
        images,
        knowledge_ids: knowledgeIds,
        function_call: functionCall,
      });
    },
    [model, mutate],
  );

  return { handleSubmit, isSubmitting: isPending };
}; 