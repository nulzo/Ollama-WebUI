export interface Knowledge {
  id: string;
  name: string;
  identifier: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  file_path?: string;
  file_size?: number;
  file_type?: string;
  status?: 'processing' | 'ready' | 'error';
  error_message?: string;
}

export interface KnowledgeList {
  count: number;
  next: string | null;
  previous: string | null;
  data: Knowledge[];
}

export type CreateKnowledgeInput = {
  name: string;
  identifier: string;
  content: string;
};

export type KnowledgeFile = {
  file: File;
  name?: string;
}; 