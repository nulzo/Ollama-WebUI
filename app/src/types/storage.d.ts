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