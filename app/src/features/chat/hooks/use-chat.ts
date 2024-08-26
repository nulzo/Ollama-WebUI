import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from "uuid";
import { Storage } from "@/services/storage";
import { DATABASE_SETTINGS } from "@/settings/database";

const storage = new Storage(DATABASE_SETTINGS);

export function useChatManagement(model) {
    const [uuid, setUuid] = useState("");

    const createChat = useCallback(async () => {
        const newUuid = uuidv4();
        setUuid(newUuid);
        await storage.createChat({ uuid: newUuid, model });
    }, [model]);

    const getChatHistory = useCallback(async (id) => {
        const response = await storage.getChat(id);
        if (response) {
            setUuid(response.uuid);
            return response.messages || [];
        }
        return [];
    }, []);

    return {
        uuid,
        setUuid,
        createChat,
        getChatHistory
    };
}