import { useState, useCallback } from 'react';
import { Storage } from "@/services/storage";
import { DATABASE_SETTINGS } from "@/settings/database";
import { Message } from '@/types/providers/ollama';

const storage = new Storage(DATABASE_SETTINGS);

export function useMessage(model: string, uuid: string) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [message, setMessage] = useState("");

    const write = useCallback(async (response): Promise<void> => {
        let curr = "";
        for await (const part of response) {
            curr += part.message.content;
        }
        setIsTyping(false);
        const newMessage: Message = { role: "assistant", content: curr, chat: uuid, model };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        await storage.createMessage(newMessage);
    }, [uuid, model]);

    return {
        messages,
        message,
        isTyping,
        setMessages,
        setMessage,
        setIsTyping,
        write
    };
}