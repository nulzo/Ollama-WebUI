export interface Model {
    description?: string;
    displayName?: string;
    enabled?: boolean;
    files?: boolean;
    functionCall?: boolean;
    id: string;
    maxOutput?: number;
    tokens?: number;
    vision?: boolean;
}

export interface Parameters {
    frequency_penalty?: number;
    max_tokens?: number;
    presence_penalty?: number;
    temperature?: number;
    top_p?: number;
}

export type Role = 'user' | 'system' | 'assistant' | 'tool';

export interface LLMMessage {
    content: string;
    role: LLMRoleType;
}
