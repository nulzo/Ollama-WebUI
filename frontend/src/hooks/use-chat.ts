import { useState, useEffect, useCallback } from 'react';
import { Ollama } from '@/services/provider/ollama/ollama.ts';
import { OLLAMA_SETTINGS } from '@/settings/ollama';
import { ChatResponse, Message } from '@/types/providers/ollama';
import { v4 as uuidv4 } from "uuid";
import { settingsService, conversationService, messageService } from '@/services/storage/client.ts';
import { useModelStore } from '@/features/models/store/model-store';

const ollama = new Ollama(OLLAMA_SETTINGS);


export function useChat() {
    const { model, setModel } = useModelStore();
    const [uuid, setUuid] = useState("");
    const [message, setMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchModel = async () => {
            const settings = await settingsService.fetchSettings();
            const default_model = settings.default_model;
            setModel(default_model ?? '');
            setLoading(false);
        };
        fetchModel();
    }, [setModel]);

    const write = useCallback(async (response: ChatResponse[]): Promise<void> => {
        let curr = "";
        for await (const part of response) {
            curr += part.message.content;
        }
        setIsTyping(false);
        setMessages((prevMessages) => [
            ...prevMessages,
            {
                role: "assistant",
                content: curr,
                chat: uuid,
                model: model?.model
            }
        ]);
        await messageService.createMessage({ model: model?.model, content: curr, role: "assistant", conversation: uuid });
    }, [uuid, model]);


    const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!model) {
            return;
        }

        const newMessage: Message = { model: model.model, content: message, role: "user", conversation: uuid };
        await messageService.createMessage(newMessage);

        const newHistory = [...messages, newMessage];
        setMessages(newHistory);
        setMessage("");
        setIsTyping(true);
        const response = await ollama.chat({ model: model.model, messages: newHistory }, { stream: true });
        await write(response);
    }, [message, messages, uuid, model, write]);

    const createChat = useCallback(async () => {
        const newUuid = uuidv4();
        setUuid(newUuid);
        setMessages([]);
        await conversationService.createConversation({ uuid: newUuid, model: model.model, created_by: "Nolan" });
    }, [model]);
    
    const getChatHistory = useCallback(async (id: string) => {
        const response = await conversationService.fetchConversation(id);
        if (response) {
            setUuid(response.uuid);
            setMessages(response.messages || []);
        }
    }, []);

    return {
        model,
        uuid,
        message,
        isTyping,
        messages,
        loading,
        setModel,
        setMessage,
        handleSubmit,
        createChat,
        getChatHistory
    };
}
