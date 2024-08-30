import { FetchWrapper } from "@/services/fetch.ts";
import { Fetch, FetchConfig } from "@/types/fetch";
import {CreateChat, CreateMessage, Settings} from "@/types/storage";
import {HttpClientConfig} from "@/types/http.ts";


export class Storage {
  private readonly _config: HttpClientConfig;
  private _client: FetchWrapper;

  constructor(config: HttpClientConfig) {
    this._config = config;
    this._client = new FetchWrapper(this._config);
  }

  async createMessage(message: CreateMessage) {
    const msg = {
      content: message.content,
      role: message.role,
      model: message.model,
      chat: message.chat
    }
    const response = await this._client.post('/messages/', JSON.stringify(msg));
    return await response.json();
  }

  async createChat(chat: CreateChat) {
    const response = await this._client.post('/conversations/', JSON.stringify({
      model: chat.model, uuid: chat.uuid
    }));
    return await response.json();
  }

  async getChats() {
    const response = await this._client.get('/conversations/');
    return await response.json();
  }

  async getChat(id: string) {
    const response = await this._client.get(`/conversations/${id}/`);
    return await response.json();
  }

  async getUser() {
    const response = await this._client.get('/settings/');
    return await response.json();
  }

  async getSettings() {
    const response = await this._client.get('/settings/');
    return await response.json();
  }

  async setSettings(settings: any) {
    const response = await this._client.put('/settings/1/', settings);
    return await response.json();
  }
}
