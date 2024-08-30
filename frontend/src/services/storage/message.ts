import { FetchWrapper } from "@/services/fetch.ts";
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

    constructor(fetchWrapper: FetchWrapper) {
        super();
        this._client = fetchWrapper;
    }

    async fetchMessage(_message: Message) {
        const response = await this._client.get('/messages/', {body: JSON.stringify(_message)});
        return await response.json();
    }

    async storeMessage(_message: Message) {
        const response = await this._client.put('/messages/', JSON.stringify(_message));
        return await response.json();
    }

    async createMessage(_message: Message) {
        const response = await this._client.post('/messages/', JSON.stringify(_message));
        return await response.json();
    }

    async removeMessage(_message: Message) {
        const response = await this._client.delete('/messages/', { _message });
        return await response.json();
    }
}
