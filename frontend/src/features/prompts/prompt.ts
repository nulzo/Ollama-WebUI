export interface Prompt {
    id: string;
    title: string;
    command: string;
    description?: string;
    content: string;
    tags?: string[];
    created_at: string;
    updated_at: string;
    user_id: string;
  }
  
  export type CreatePromptInput = {
    title: string;
    command: string;
    description?: string;
    content: string;
    tags?: string[];
  };