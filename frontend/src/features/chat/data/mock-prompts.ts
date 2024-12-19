export interface CustomPrompt {
    id: string;
    title: string;
    command: string;
    content: string;
    created_at: string;
  }
  
  export const mockPrompts: CustomPrompt[] = [
    {
      id: '1',
      title: 'Code Review',
      command: 'review',
      content: 'Please review this code and suggest improvements: \n\n```\n{cursor}\n```',
      created_at: '2024-03-20T10:00:00Z',
    },
    {
      id: '2',
      title: 'Explain Code',
      command: 'explain',
      content: 'Please explain how this code works in detail: \n\n```\n{cursor}\n```',
      created_at: '2024-03-20T10:00:00Z',
    },
    {
      id: '3',
      title: 'Debug Help',
      command: 'debug',
      content: 'Help me debug this code and find potential issues: \n\n```\n{cursor}\n```',
      created_at: '2024-03-20T10:00:00Z',
    },
    {
      id: '4',
      title: 'Optimize Code',
      command: 'optimize',
      content: 'Please suggest optimizations for this code: \n\n```\n{cursor}\n```',
      created_at: '2024-03-20T10:00:00Z',
    },
  ];