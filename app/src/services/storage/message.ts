import { FetchWrapper } from "@/services/fetch.ts";
import { Fetch } from "@/types/fetch";
import {Message} from "@/types/providers/ollama";


export class IMessageService {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fetchUser(_message: Message) { throw new Error('Not implemented'); }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    storeUser(_message: Message) { throw new Error('Not implemented'); }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    removeUser(_message: Message) { throw new Error('Not Implemented'); }
}

export class MessageService extends IMessageService {
    private _client: FetchWrapper;
    private readonly _fetch: Fetch;

    constructor(fetchWrapper: FetchWrapper, fetch: Fetch) {
        super();
        this._client = fetchWrapper;
        this._fetch = fetch;
    }

    async fetchMessage(_message: Message) {
        const response = await this._client.get(this._fetch, '/chats/', { _message });
        return await response.json();
    }

    async storeMessage(_message: Message) {
        const response = await this._client.put(this._fetch, '/chats/', { _message });
        return await response.json();
    }

    async removeMessage(_message: Message) {
        const response = await this._client.delete(this._fetch, '/chats/', { _message });
        return await response.json();
    }
}
