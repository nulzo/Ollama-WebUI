export interface MarkdownRendererProps {
  markdown: string;
  citations?: Array<{
    text: string;
    chunk_id: string;
    knowledge_id: string;
    metadata?: {
      source?: string;
      page?: number;
      row?: number;
      citation?: string;
      [key: string]: any;
    };
  }>;
}
