export interface OllamaSettings {
    host: string,
    port?: number,
    endpoint?: string
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
