import {FetchWrapper} from "@/services/fetch.ts";
import {Message, FetchConfig, ChatResponse} from "@/types/ollama";
import {Fetch} from "@/types/fetch";
import { CreateChat, CreateMessage } from "@/types/storage";


export class Storage {
    private readonly _config: FetchConfig;
    private _client: FetchWrapper;
    private _fetch: Fetch;

    constructor(config: FetchConfig) {
      this._config = config;
      this._client = new FetchWrapper(this._config);
      this._fetch = fetch;
    }

    async createMessage(message: CreateMessage) {
      const response = await this._client.post(this._fetch, '/messages/', {
        content: message.message,
        role: message.role,
        model: message.model,
        chat: message.chat
      });
      return await response.json();
  }

  async createChat(chat: CreateChat) {
    const response = await this._client.post(this._fetch, '/chats/', {
      model: chat.model, name: chat.name
    })
    return await response.json();
  }

  async getChats() {
    const response = await this._client.get(this._fetch, '/chats/');
    return await response.json();
  }

  async getChat(id: number) {
    const response = await this._client.get(this._fetch, `/chats/${id}`);
    return await response.json();
  }
}
