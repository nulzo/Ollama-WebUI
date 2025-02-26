export type Meta = {
  page: number;
  total: number;
  totalPages: number;
};

export interface User {
  user_id: number;
  email: string;
  token: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  meta: {
    timestamp: string;
    request_id: string;
    version: string;
  };
  status: number;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
  links?: {
    self: string;
    [key: string]: string;
  };
  pagination?: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}

/**
 * Represents a chunk of data received during streaming
 */
export interface StreamChunk {
  // For general status updates
  status?: 'waiting' | 'generating' | 'done' | 'error' | 'cancelled';
  
  // For content chunks
  content?: string;
  
  // For delta format (OpenAI style)
  delta?: {
    content?: string;
    role?: string;
  };
  
  // For conversation creation
  conversation_uuid?: string;
  
  // For completion
  type?: 'done';
  
  // For errors
  error?: string;
  
  // For message ID
  message_id?: string;
  
  // For token usage stats
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  
  // For error details
  is_error?: boolean;
  error_code?: string;
  error_title?: string;
  error_description?: string;
}

/**
 * Represents a message in the chat
 */
export interface ChatMessage {
  id?: string;
  role: string;
  content: string;
  user?: string | null;
  model?: string;
  name?: string;
  provider?: string;
  images?: string[] | number[];
  created_at?: string;
  conversation_uuid?: string;
  liked_by?: string[];
  has_images?: boolean;
}

/**
 * Input for creating a new message
 */
export interface CreateMessageInput {
  conversation?: string;
  role: string;
  content: string;
  model: string;
  user?: string | null;
  images?: string[];
  provider?: string;
  name?: string;
}