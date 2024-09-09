export interface Conversation {
  created_at?: Date;
  is_pinned?: boolean;
  is_hidden?: boolean;
  updated_at?: Date;
  uuid: string;
  name?: string | null;
  userId: number | string | null;
}
