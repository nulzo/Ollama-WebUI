export interface Message {
    id:? string;
    chat?: string;
    username?: string;
    message?: string;
    isBot?: boolean;
    isTyping?: boolean;
    time?: string;
}
