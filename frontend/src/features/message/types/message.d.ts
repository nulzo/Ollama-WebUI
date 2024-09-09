export interface Message {
  conversation?: string;
  id?: string | number;
  role: string;
  content: string;
  created_at?: Date;
  model?: number | null;
  user?: number | null;
}
