import { z } from 'zod';

export const businessSchema = z.object({
  name: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  timezone: z.string().min(3),
  system_currency: z.string().regex(/^[A-Z]{3}$/),
});
