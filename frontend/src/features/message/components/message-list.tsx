import { Spinner } from '@/components/ui/spinner';

import { useMessages } from '@/features/message/api/get-messages';
import Message from '@/features/message/components/message.tsx';

type CommentsListProps = {
  conversation_id: string;
};

export const MessagesList = ({ conversation_id }: CommentsListProps) => {
  const messageQuery = useMessages({ conversation_id });

  if (messageQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const messages = messageQuery?.data;

  if (!messages) return null;

  return (
    <div>
      {messages.length !== 0 &&
        messages.map((message, index) => (
          <Message
            key={`message-${message.id}-${index}`}
            id={message?.id ?? ''}
            isBot={message?.role !== 'user'}
            isTyping={false}
            message={message?.content}
            time={message.created_at}
            username={message?.role === 'user' ? message?.role : (message?.model ?? 'assistant')}
          />
        ))}
    </div>
  );
};
