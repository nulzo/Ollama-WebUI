import { FetchWrapper } from "@/services/fetch.ts";
import { Fetch } from "@/types/fetch";
import { Chat } from "@/types/ollama";
import { Settings } from "@/types/storage";

export class ISettingsService {
    fetchSettings() { throw new Error('Not implemented'); }
    createSettings(_settings: Settings) { throw new Error('Not implemented'); }
}

export class SettingsService extends ISettingsService {
    private _client: FetchWrapper;
    private _fetch: Fetch;
    
    constructor(fetchWrapper: FetchWrapper, fetch: Fetch) {
      super();
      this._client = fetchWrapper;
      this._fetch = fetch;
    }
  
    async updateSettings(chat: Chat) {
      const response = await this._client.put(this._fetch, '/chats/', {
        model: chat.model,
        uuid: chat.uuid
      });
      return await response.json();
    }
  
    async fetchSettings() {
      const response = await this._client.get(this._fetch, '/chats/');
      return await response.json();
    }

    async createSettings() {
        const response = await this._client.put(this._fetch, '/chats/');
        return await response.json();
      }
  }
