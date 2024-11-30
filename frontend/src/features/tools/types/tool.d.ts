export interface Tool {
    id: string;
    name: string;
    description: string;
    function_content: string;
    language: 'python' | 'javascript' | 'typescript';
    parameters: Record<string, any>;
    returns: Record<string, any>;
    docstring: string;
    is_enabled: boolean;
    created_at: string;
    modified_at: string;
    created_by: {
      id: string;
      name: string;
      email: string;
    };
  }