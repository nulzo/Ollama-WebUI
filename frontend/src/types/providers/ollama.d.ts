export interface Message {
    conversation?: string
    role: 'user' | 'assistant'
    model: string
    time?: string
    content: string
    images?: Uint8Array[] | string[]
}

export interface OllamaConfig {
    endpoint: string
    port: number
    host: string
}

export interface OllamaOpts {
    num_ctx: number
    low_vram: boolean
    embedding_only: boolean
    seed: number
    num_predict: number
    top_k: number
    top_p: number
    tfs_z: number
    typical_p: number
    repeat_last_n: number
    temperature: number
    repeat_penalty: number
    presence_penalty: number
    frequency_penalty: number
    penalize_newline: boolean
    stop: string[]
}

export interface Chat {
    model: string
    messages?: Message[]
    uuid: string,
    stream?: boolean
    format?: string
    keep_alive?: string | number
    opts?: OllamaOpts
}

export interface ChatResponse {
    model: string
    uuid: string,
    created_at: Date
    message: Message
    done: boolean
    total_duration: number
    load_duration: number
    prompt_eval_count: number
    prompt_eval_duration: number
    eval_count: number
    eval_duration: number
}
