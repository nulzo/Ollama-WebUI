export interface Conversation {
  created_at?: string; // ISO date string
  is_pinned?: boolean;
  is_hidden?: boolean;
  updated_at?: string; // ISO date string
  uuid: string; // Primary key
  name?: string;
  user_id: number; // Foreign key to CustomUser
}
