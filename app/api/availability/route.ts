import { NextResponse } from 'next/server';
import { availabilityQuerySchema } from '@/lib/validators/availability';
import { generateSlots } from '@/lib/slots/generateSlots';
import { createClient as createAdmin } from '@supabase/supabase-js';

function adminClient() {
  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(request: Request) {
  const supabase = adminClient();
  const { searchParams } = new URL(request.url);
  const parsed = availabilityQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { slug, serviceId, date } = parsed.data;
  const { data: business } = await supabase.from('businesses').select('*').eq('slug', slug).single();
  if (!business) return NextResponse.json({ slots: [] });
  const { data: service } = await supabase.from('services').select('*').eq('id', serviceId).eq('business_id', business.id).eq('is_active', true).single();
  if (!service) return NextResponse.json({ slots: [] });
  const weekday = new Date(`${date}T00:00:00`).getDay();
  const { data: weeklyRule } = await supabase.from('availability_rules').select('*').eq('business_id', business.id).eq('weekday', weekday).single();
  const { data: exception } = await supabase.from('availability_exceptions').select('*').eq('business_id', business.id).eq('date', date).maybeSingle();
  const dayStart = new Date(`${date}T00:00:00.000Z`).toISOString();
  const dayEnd = new Date(`${date}T23:59:59.999Z`).toISOString();
  const { data: bookings } = await supabase.from('bookings').select('start_at,end_at').eq('business_id', business.id).eq('status', 'confirmed').gte('start_at', dayStart).lte('start_at', dayEnd);
  const slots = generateSlots({ date, timezone: business.timezone, serviceDurationMinutes: service.duration_minutes, weeklyRule: weeklyRule ? { start_time: weeklyRule.start_time, end_time: weeklyRule.end_time, breaks: weeklyRule.breaks } : null, exception: exception ? { is_closed: exception.is_closed, start_time: exception.start_time, end_time: exception.end_time, breaks: exception.breaks } : null, existingBookings: bookings ?? [] });
  return NextResponse.json({ slots });
}
