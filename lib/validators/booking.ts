import { z } from 'zod';
export const bookingSchema = z.object({ slug: z.string().min(1), serviceId: z.string().uuid(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), startTime: z.string(), customer_name: z.string().min(2), customer_email: z.string().email(), note: z.string().optional() });
