export interface CreateMessage {
    model: string,
    content: string,
    role: string,
    chat: string
}

export interface CreateChat {
    model: string,
    uuid: string,
    name?: string
}

export interface User {
    id?: number,
    name?: string
    color?: string
}

export interface Settings {
    ollama_ip: string,
    ollama_port: number,
    ollama_default_model: string,
}