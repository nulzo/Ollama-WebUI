import { FetchWrapper } from "@/services/fetch.ts";
import { Fetch } from "@/types/fetch";
import {Chat} from "@/types/chat";


export class IChatService {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fetchChat(_chat: Chat) { throw new Error('Not implemented'); }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    storeChat(_chat: Chat) { throw new Error('Not implemented'); }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    removeChat(_chat: Chat) { throw new Error('Not Implemented'); }
}

export class ChatService extends IChatService {
    private _client: FetchWrapper;

    constructor(fetchWrapper: FetchWrapper) {
        super();
        this._client = fetchWrapper;
    }

    async fetchChat(_chat: Chat) {
        const response = await this._client.get(`/conversations/${_chat.uuid}`);
        return await response.json();
    }

    async fetchChats() {
        const response = await this._client.get('/conversations/');
        return await response.json();
    }

    async storeChat(_chat: Chat) {
        const response = await this._client.put('/conversations/', { _chat });
        return await response.json();
    }

    async removeChat(_chat: Chat) {
        const response = await this._client.delete('/conversations/', { _chat });
        return await response.json();
    }
}
