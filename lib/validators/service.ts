import { z } from 'zod';
export const serviceSchema = z.object({ name: z.string().min(2), duration_minutes: z.number().int().min(15), price_cents: z.number().int().min(0), is_active: z.boolean().default(true) });
