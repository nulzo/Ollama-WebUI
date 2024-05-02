import { z } from 'zod';

const userSchema = z.object({
  color: z.string(),
});

export const UserSchema = z.object({
  avatar: z.string().optional(),
  settings: userSchema.partial(),
  uuid: z.string(),
});

export type DatabaseUser = z.infer<typeof UserSchema>;
export type DatabaseUserSettings = z.infer<typeof userSchema>;