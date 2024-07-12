export interface CreateMessage {
    model: string,
    message: string,
    role: string,
    chat_uuid: string
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
