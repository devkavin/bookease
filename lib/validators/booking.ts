import { z } from 'zod';

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9][0-9]{7,14}$/, 'Use a valid phone number with country code (E.164 format).');

export const bookingSchema = z.object({
  slug: z.string().min(1),
  serviceId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string(),
  customer_name: z.string().min(2),
  customer_email: z.string().email(),
  customer_phone: phoneSchema,
  note: z.string().optional(),
});
