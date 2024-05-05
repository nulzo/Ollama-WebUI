import {FetchWrapper} from "@/services/fetch.ts";
import {Message, FetchConfig} from "@/types/ollama";
import {Fetch} from "@/types/fetch";


export class Storage {
    private readonly _config: FetchConfig;
    private _client: FetchWrapper;
    private _fetch: Fetch;
    constructor(config: FetchConfig) {
      this._config = config;
      this._client = new FetchWrapper(this._config);
      this._fetch = fetch;
    }
    async createMessage(message: Message) {
      return await this._client.get(this._fetch, '/chats', {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*' 
      });
  }
}
