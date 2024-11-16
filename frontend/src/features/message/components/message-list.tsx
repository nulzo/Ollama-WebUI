import { Spinner } from '@/components/ui/spinner';
import { useMessages } from '@/features/message/api/get-messages';
import Message from '@/features/message/components/message';
import { useMutationState } from '@tanstack/react-query';
import { useModelStore } from '@/features/models/store/model-store';
import { TypingIndicator } from './typing-indicator';

interface MessagesListProps {
  conversation_id: string;
}

export const MessagesList = ({ conversation_id }: MessagesListProps) => {
  const { data: messagesResponse, isLoading } = useMessages({ conversation_id });
  const { model } = useModelStore(state => ({ model: state.model }));

  const pendingMessages = useMutationState({
    filters: { mutationKey: ['createMessage', conversation_id], status: 'pending' },
    select: mutation => mutation.state.variables?.data,
  });

  const isTyping = pendingMessages?.length > 0;

  if (isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Use messagesResponse directly since it's already an array
  const confirmedMessages = messagesResponse || [];

  const allMessages = [
    ...confirmedMessages,
    ...pendingMessages.filter(
      pendingMsg =>
        pendingMsg.role === 'user' &&
        !confirmedMessages.some(
          confirmedMsg =>
            confirmedMsg.content === pendingMsg.content && 
            confirmedMsg.role === pendingMsg.role
        )
    ),
  ];

  return (
    <div className="flex flex-col space-y-4 pb-4">
      {allMessages.map((message, index) => (
        <Message
          key={`message-${message.id || index}`}
          id={message.id || ''}
          role={message.role}
          content={message.content}
          time={message.created_at}
          username={message.role === 'user' ? message.role : message.model || 'assistant'}
          image={message.image}
          isTyping={false}
        />
      ))}
      {isTyping && <TypingIndicator isTyping={true} model={model?.name || ''} />}
    </div>
  );
};