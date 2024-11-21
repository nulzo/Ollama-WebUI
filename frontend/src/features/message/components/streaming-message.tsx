import React from 'react';
import { Message as MessageType } from '@/features/message/types/message';
import Message from './message';

interface StreamingMessageProps {
  content: string;
  model: string;
  conversation_id: string;
}

export const StreamingMessage = React.memo(({ content, model, conversation_id }: StreamingMessageProps) => {
  return (
    <Message
      id={0}
      role="assistant"
      content={content}
      model={model}
      user={null}
      conversation_id={conversation_id}
      time={Date.now()}
      isTyping={true}
      username={model || 'Assistant'}
    />
  );
});
