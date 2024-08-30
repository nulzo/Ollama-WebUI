import { FetchWrapper } from "@/services/fetch.ts";
import {Conversation} from "@/features/conversation/types/conversation";


export class ConversationService {
    private _client: FetchWrapper;

    constructor(fetchWrapper: FetchWrapper) {
        this._client = fetchWrapper;
    }

    async fetchConversation(conversation_id: string) {
        const response = await this._client.get(`/conversations/${conversation_id}/`);
        return await response.json();
    }

    async fetchConversations() {
        const response = await this._client.get('/conversations/');
        return await response.json();
    }

    async createConversation(conversation: Conversation) {
        const response = await this._client.post('/conversations/', JSON.stringify(conversation));
        return await response.json();
    }

    async storeConversation(conversation: Conversation) {
        const response = await this._client.put('/conversations/', JSON.stringify(conversation));
        return await response.json();
    }

    async removeConversation(conversation: Conversation) {
        const response = await this._client.delete(`/conversations/${conversation.uuid}`);
        return await response.json();
    }
}
