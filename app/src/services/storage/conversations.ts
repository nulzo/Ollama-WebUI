import { FetchWrapper } from "@/services/fetch.ts";
import { Fetch } from "@/types/fetch";


export class IConversationService {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fetchConversation(_conversation: any) { throw new Error('Not implemented'); }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    storeConversation(_conversation: any) { throw new Error('Not implemented'); }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    removeConversation(_conversation: any) { throw new Error('Not Implemented'); }
}

export class ConversationService extends IConversationService {
    private _client: FetchWrapper;
    private readonly _fetch: Fetch;

    constructor(fetchWrapper: FetchWrapper, fetch: Fetch) {
        super();
        this._client = fetchWrapper;
        this._fetch = fetch;
    }

    async fetchConversation(_conversation: any) {
        const response = await this._client.get(this._fetch, '/chats/', { _conversation });
        return await response.json();
    }

    async fetchConversations() {
        const response = await this._client.get(this._fetch, '/chats/');
        return await response.json();
    }

    async storeConversation(_conversation: any) {
        const response = await this._client.put(this._fetch, '/chats/', { _conversation });
        return await response.json();
    }

    async removeConversation(_conversation: any) {
        const response = await this._client.delete(this._fetch, '/chats/', { _conversation });
        return await response.json();
    }
}
