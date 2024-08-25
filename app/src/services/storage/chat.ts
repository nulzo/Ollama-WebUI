import { FetchWrapper } from "@/services/fetch.ts";
import { Fetch } from "@/types/fetch";
import {Chat} from "@/types/providers/ollama";


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
    private readonly _fetch: Fetch;

    constructor(fetchWrapper: FetchWrapper, fetch: Fetch) {
        super();
        this._client = fetchWrapper;
        this._fetch = fetch;
    }

    async fetchChat(_chat: Chat) {
        const response = await this._client.get(this._fetch, '/chats/', { _chat });
        return await response.json();
    }

    async storeChat(_chat: Chat) {
        const response = await this._client.put(this._fetch, '/chats/', { _chat });
        return await response.json();
    }

    async removeChat(_chat: Chat) {
        const response = await this._client.delete(this._fetch, '/chats/', { _chat });
        return await response.json();
    }
}
