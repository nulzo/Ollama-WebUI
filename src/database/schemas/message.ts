import { z } from 'zod';

export const MessageSchema = z.object({
  role: z.enum(['user', 'system', 'assistant', 'function']),
  content: z.string(),
  model: z.string().optional(),
  files: z.array(z.string()).optional(),
  pId: z.string().optional(),
  sId: z.string().optional(),
  tId: z.string().nullable().optional(),
});

export type DatabaseMessage = z.infer<typeof MessageSchema>;