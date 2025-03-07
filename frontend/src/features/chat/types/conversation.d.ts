// export interface Conversation {
//   created_at?: string; // ISO date string
//   is_pinned?: boolean;
//   is_hidden?: boolean;
//   updated_at?: string; // ISO date string
//   uuid: string; // Primary key
//   name?: string;
//   user_id: number; // Foreign key to CustomUser
// }

export interface Conversation {
  uuid: string;
  name: string;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
}

export interface ConversationList {
  count: number;
  next: string | null;
  previous: string | null;
  results: Conversation[];
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  created_at: string;
  model: string;
  name: string;
}

export interface Prompt {
  title: string;
  prompt: string;
  simple_prompt: string;
  style: string;
}

export interface PromptsResponse {
  prompts: Prompt[];
  metadata: {
    style: string;
    provider: string;
    model: string | null;
  };
}
