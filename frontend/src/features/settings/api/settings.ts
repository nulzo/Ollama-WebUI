import { FetchWrapper } from "@/services/fetch.ts";
import { Settings } from "@/types/storage";

export class SettingsService {
    private _client: FetchWrapper;
    
    constructor(fetchWrapper: FetchWrapper) {
      this._client = fetchWrapper;
    }
  
    async fetchSettings() {
      const response = await this._client.get('/conversations/');
      return await response.json();
    }

    async updateSettings(_settings: Settings) {
        const response = await this._client.put('/conversations/', JSON.stringify(_settings));
        return await response.json();
      }
  }
