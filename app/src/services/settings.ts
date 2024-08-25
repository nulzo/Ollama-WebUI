import { FetchWrapper } from "@/services/fetch.ts";
import { Fetch } from "@/types/fetch";
import { Settings } from "@/types/storage";

export class ISettingsService {
    fetchSettings() { throw new Error('Not implemented'); }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateSettings(_settings: Settings) { throw new Error('Not implemented'); }
}

export class SettingsService extends ISettingsService {
    private _client: FetchWrapper;
    private readonly _fetch: Fetch;
    
    constructor(fetchWrapper: FetchWrapper, fetch: Fetch) {
      super();
      this._client = fetchWrapper;
      this._fetch = fetch;
    }
  
    async fetchSettings() {
      const response = await this._client.get(this._fetch, '/chats/');
      return await response.json();
    }

    async updateSettings(_settings: Settings) {
        const response = await this._client.put(this._fetch, '/chats/', _settings);
        return await response.json();
      }
  }
