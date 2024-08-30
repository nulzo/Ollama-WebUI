import { FetchWrapper } from "@/services/fetch.ts";
import {Message} from "@/types/providers/ollama";
import { CreateMessageInput } from "../hooks/use-create-message";


export class MessageService {
    private _client: FetchWrapper;

    constructor(fetchWrapper: FetchWrapper) {
        this._client = fetchWrapper;
    }

    async fetchMessages() {
        const response = await this._client.get('/messages/');
        return await response.json();
    }

    async fetchMessage(_message: Message) {
        const response = await this._client.get(`/messages/${_message.conversation}`);
        return await response.json();
    }

    async storeMessage(_message: Message) {
        const response = await this._client.put('/messages/', JSON.stringify(_message));
        return await response.json();
    }

    async removeMessage(_message: Message) {
        const response = await this._client.delete(`/messages/${_message.conversation}`);
        return await response.json();
    }

    async createMessage(_message: CreateMessageInput) {
        const response = await this._client.post(`/messages/`, JSON.stringify(_message));
        return await response.json();
    }
}
