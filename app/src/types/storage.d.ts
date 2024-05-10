export interface CreateMessage {
    model: string,
    message: string,
    role: string,
    chat: number
}

export interface CreateChat {
    model: string,
    name?: string
}

export interface Settings {
    name: string
    color?: string
}
