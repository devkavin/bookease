import { z } from 'zod';

export const availabilityQuerySchema = z.object({
  slug: z.string().min(1),
  serviceId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const availabilityCalendarQuerySchema = z.object({
  slug: z.string().min(1),
  serviceId: z.string().uuid(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
});
