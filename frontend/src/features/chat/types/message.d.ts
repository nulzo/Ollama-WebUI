// export interface Message {
//   conversation?: string;
//   id?: string | number;
//   role: string;
//   content: string;
//   created_at?: Date;
//   model?: number | null;
//   user?: number | null;
// }

export interface Message {
  id?: string | number;
  conversation_uuid: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  model: string;
  name: string;
  user_id?: number;
  has_images: boolean;
  image_ids?: (string | number)[];
  liked_by?: string[];
  is_liked?: boolean;
  is_hidden?: boolean;
  provider: string;
  // New metadata fields
  tokens_used?: number;
  generation_time?: number;
  model_config?: {
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    max_tokens?: number;
    [key: string]: any;
  };
  prompt_tokens?: number;
  completion_tokens?: number;
  total_cost?: number;
  finish_reason?: string;
  updated_at?: string;
}