import {streamJSON} from "@/services/utility.ts";
import {FetchWrapper} from "@/services/fetch.ts";
import {OllamaSettings} from "@/types/ollama";
import {Fetch} from "@/types/fetch";

export class Ollama {
    private _client: FetchWrapper;
    private readonly _settings: OllamaSettings;
    private readonly _fetch: Fetch;

    constructor(settings: OllamaSettings) {
        this._settings = settings;
        this._client = new FetchWrapper(this._settings);
        this._fetch = fetch;
    }

    protected async stream(endpoint: string, data: any, opts: { stream?: boolean } & Record<string, any>): Promise<AsyncGenerator<unknown, any, unknown>> {
        const response = await this._client.post(this._fetch, endpoint, data);
        opts.stream = opts.stream ?? false;
        if (!response.body) { throw new Error('Missing body'); }
        const iterator = streamJSON<any>(response.body);
        if(!opts.stream) {
            const message = await iterator.next();
            if (!message.value?.done && message.value?.status !== 'success') throw new Error('Expected a completed response.');
            return message.value;
        }
        return (async function* () {
            for await (const message of iterator) {
                if ('error' in message) throw new Error(message.error);
                yield message;
                if (message?.done || message?.status === 'success') { return; }
            }
            throw new Error('Did not receive done or success response in stream.')
        })();
    }

    async post(endpoint: string, data: any, opts: {stream?: boolean}): Promise<any> {
        return this.stream(endpoint, data, opts);
    }

    mergeMessageArray(userMessages: any[], botMessages: any[]): any[] {
        const mergedArray = [];
        const maxLength = Math.max(userMessages.length, botMessages.length);
        for (let i = 0; i < maxLength; i++) {
            if (i < userMessages.length) {
                mergedArray.push(userMessages[i]);
            }
            if (i < botMessages.length) {
                mergedArray.push(botMessages[i]);
            }
        }
        return mergedArray;
    }
}