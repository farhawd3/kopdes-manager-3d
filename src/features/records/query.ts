import { z } from 'zod';
import { date } from './schemas';

export const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).max(1_000_000).default(0),
  scope: z.enum(['current', 'history', 'all']).default('current'),
  project: z.string().uuid().optional(),
  id: z.string().uuid().optional(),
  q: z.string().trim().max(120).optional(),
  from: date.optional(),
  to: date.optional(),
});
export type ListQuery = z.infer<typeof listQuerySchema>;
