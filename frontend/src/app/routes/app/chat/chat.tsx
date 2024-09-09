import { Textbox } from '@/features/textbox/components/textbox';
import { useChat } from '@/hooks/use-chat';
import { useSearchParams } from 'react-router-dom';
import { Origami } from 'lucide-react';
import { PulseLoader } from 'react-spinners';
import { ConversationArea } from '@/features/conversation/components/conversation-area';
import { useModelStore } from '@/features/models/store/model-store';
import ConversationHistory from '@/features/conversation/components/conversation-history.tsx';
import { ConversationAreaHeader } from '@/features/conversation/components/conversation-area-header.tsx';
import { MessagesList } from '@/features/message/components/message-list.tsx';
import { useMessages } from '@/features/message/api/get-messages.ts';
import { ConversationDefault } from '@/features/conversation/components/conversation-default.tsx';
import useScrollToEnd from '@/hooks/use-scroll-to-end.ts';
import { useCreateMessage } from '@/features/message/api/create-message.ts';
import { useNotifications } from '@/components/notification/notification-store';

export function ChatRoute() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamString = searchParams.get('c');
  const { uuid, message, isTyping, setMessage, handleSubmit, createChat, getChatHistory } =
    useChat();

  const create_message = useCreateMessage({
    conversation_id: searchParamString ?? '',
    mutationConfig: {
      onSuccess: () => {
        useNotifications.getState().addNotification({
          type: 'success',
          title: 'Chatted with model',
          message,
        });
      },
    },
  });
  const messages = useMessages({
    conversation_id: searchParamString ?? '',
  });

  const { model } = useModelStore(state => ({
    model: state.model,
  }));

  const submit = () => {
    create_message.mutate({
      data: {
        conversation: searchParamString ?? '',
        role: 'user',
        content: message,
        model: 'llama3',
        user: 'deez',
      },
    });
  };

  const ref = useScrollToEnd(messages.data);

  return (
    <>
      <ConversationHistory
        createChat={createChat}
        getChatHistory={getChatHistory}
        uuid={uuid}
        updateURL={setSearchParams}
        messages={messages}
      />
      <div className="transition relative w-full max-w-full flex flex-col">
        <ConversationAreaHeader />
        <div className="transition relative flex flex-col flex-auto z-10">
          <ConversationArea>
            {searchParamString ? (
              <>
                <MessagesList conversation_id={searchParamString ?? ''} />
                <div ref={ref} />
              </>
            ) : (
              <ConversationDefault />
            )}
          </ConversationArea>
          <div className="pb-6 pt-4 z-[99]">
            <div className="-mb-3.5 mx-auto inset-x-0 bg-transparent flex justify-center">
              <div className="mx-auto flex flex-col max-w-4xl justify-center px-2.5 md:px-6 w-full">
                <div className=" flex justify-center">
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center z-30 pointer-events-none">
                    {isTyping && (
                      <div className="mx-auto z-50 bg-primary/10 backdrop-blur p-2 rounded-lg left-0">
                        <div className="flex gap-2 items-center">
                          <Origami className="size-5" strokeWidth="1" /> {model?.model} is typing{' '}
                          <PulseLoader
                            size="3"
                            speedMultiplier={0.75}
                            color="#ffffff"
                            className="stroke-primary-foreground"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Textbox
              value={message}
              setValue={setMessage}
              onSubmit={submit}
              model={model?.name || ''}
            />
            <div className="text-xs gap-1 text-muted-foreground mt-1 pb-1 flex w-full text-center justify-center">
              CringeGPT <span className="italic">never</span> makes mistakes.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
