import { FetchWrapper } from "@/services/fetch.ts";
import {Conversation} from "@/features/conversation/types/conversation";


export class IConversationService {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fetchConversation(_conversation: Conversation) { throw new Error('Not implemented'); }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    storeConversation(_conversation: Conversation) { throw new Error('Not implemented'); }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    removeConversation(_conversation: Conversation) { throw new Error('Not Implemented'); }
}

export class ConversationService extends IConversationService {
    private _client: FetchWrapper;

    constructor(fetchWrapper: FetchWrapper) {
        super();
        this._client = fetchWrapper;
    }

    async fetchConversation(conversation: Conversation) {
        const response = await this._client.get(`/conversations/${conversation}`);
        return await response.json();
    }

    async fetchConversations() {
        const response = await this._client.get('/conversations/');
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
