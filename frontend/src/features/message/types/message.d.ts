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
  conversation_id: string; // Make this required
  role?: string;
  content: string;
  created_at?: string;
  model_id?: number;
  user_id?: number;
  image?: string;
}