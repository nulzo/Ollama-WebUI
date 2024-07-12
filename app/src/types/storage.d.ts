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

export interface Settings {
    name: string
    color?: string
}
