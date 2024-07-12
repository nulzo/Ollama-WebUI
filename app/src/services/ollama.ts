import {streamJSON} from "@/services/utility.ts";
import {FetchWrapper} from "@/services/fetch.ts";
import {Message} from "@/types/ollama";
import {Fetch, FetchConfig} from "@/types/fetch";

export interface Chat {
    model: string,
    message: Message | Message[],
    format?: 'json',
    options?: string,
    stream?: boolean,
    keep_alive?: string
}

export interface Generate {
    model: string,
    prompt: string,
    images?: string[],
    format?: 'json',
    options?: string,
    system?: string,
    template?: string,
    stream?: boolean,
    keep_alive?: string
}

export interface Show {
    name: string
}

export interface Create {
    name: string,
    modelfile?: string,
    stream?: boolean,
    path?: string
}

export interface Pull {
    name: string,
    insecure?: boolean,
    stream?: boolean
}

/* The Ollama interface serves as a custom wrapper that sits around the Ollama API.
 *
 * **/

export class Ollama {
    private _client: FetchWrapper;
    private readonly _settings: FetchConfig;
    private readonly _fetch: Fetch;

    constructor(settings: FetchConfig) {
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

    protected async retrieve(endpoint: string): Promise<any> {
        const response = await this._client.get(this._fetch, endpoint);
        return await response.json();
    }

    async chat(data: Chat, opts: {stream?: boolean}): Promise<any> {
        // Streaming with message history
        return this.stream('chat', data, opts);
    }

    async generate(data: Generate, opts: {stream?: boolean}): Promise<any> {
        // One shot chat messaging
        return this.stream('generate', data, opts);
    }

    async show(data: Show, opts: any = {}) {
        // Show model information
        // data is {'name': <model>}
        return this.stream('show', data, opts);
    }

    async list() {
        // List all available models
        return await this.retrieve("tags");
    }

    async create(data: Create, opts: any) {
        // Create a new model api/create
        // takes in {name: string, modelfile: string|opt, stream: boolean|opt, path: string|opt}
        return this.stream('create', data, opts);
    }

    async pull(data: Pull, opts: any) {
        // pulls a model from public ollama library api/pull
        return this.stream('pull', data, opts);
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
