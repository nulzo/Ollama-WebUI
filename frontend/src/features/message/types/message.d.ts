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
  id?: number;
  conversation_id?: string; // Foreign key to Conversation
  role?: string;
  content: string;
  created_at?: string; // ISO date string
  model_id?: number; // Optional foreign key to Assistant
  user_id?: number; // Optional foreign key to CustomUser
  image?: string; // Optional
}
