import { memo, useState, useEffect } from 'react';
import { useModelStore } from '@/features/models/store/model-store';
import { useSubmitHandler } from '@/features/chat/hooks/use-submit-handler';
import { useChatMutation } from '@/features/chat/hooks/use-chat-mutation';
import { ChatContainer } from '@/features/chat/components/chat-container';
import { ChatInput } from '@/features/textbox/components/chat-input';
import { FunctionCallToggle } from '../function-call-toggle';
import { useSearchParams } from 'react-router-dom';
import { useStreamingStore, StreamingState, StreamingActions } from '../../stores/streaming-store';

export const ChatView = memo(() => {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('c');
  const model = useModelStore((state) => state.model);
  const { handleSubmit, isSubmitting } = useSubmitHandler();
  const { handleCancel } = useChatMutation(conversationId || undefined);
  const [functionCall, setFunctionCall] = useState(false);
  const setConversationId = useStreamingStore(
    (state: StreamingState & StreamingActions) => state.setConversationId,
  );

  useEffect(() => {
    setConversationId(conversationId);
  }, [conversationId, setConversationId]);

  if (!conversationId) return null;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <ChatContainer conversation_id={conversationId} />
      </div>
      <div className="p-4 border-t shrink-0">
        {model?.tools_enabled && (
          <FunctionCallToggle enabled={functionCall} onToggle={setFunctionCall} />
        )}
        <ChatInput
          onSubmit={(message, images, knowledgeIds) => handleSubmit(message, images, knowledgeIds, functionCall)}
          disabled={isSubmitting}
          onCancel={handleCancel}
          isGenerating={isSubmitting}
        />
      </div>
    </div>
  );
});

ChatView.displayName = 'ChatView'; 