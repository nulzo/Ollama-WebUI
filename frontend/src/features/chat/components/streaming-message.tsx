import { Message } from './message.tsx';

interface StreamingMessageProps {
  content: string;
  conversation_id: string;
}

export function StreamingMessage({ content, conversation_id }: StreamingMessageProps) {
  return (
    <Message
      id={0}
      role="assistant"
      content={content}
      created_at={new Date().toISOString()}
      conversation_id={conversation_id}
      isTyping={true}
    />
  );
}
