import { endOfMonth, format, startOfMonth } from 'date-fns';
import { NextResponse } from 'next/server';
import { createClient as createAdmin, SupabaseClient } from '@supabase/supabase-js';
import { generateSlots } from '@/lib/slots/generateSlots';
import { createClient as createServer } from '@/lib/supabase/server';
import { availabilityCalendarQuerySchema } from '@/lib/validators/availability';

function adminClient(): SupabaseClient | null {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function dayKey(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

export async function GET(request: Request) {
  const supabase = adminClient() ?? (await createServer());
  const { searchParams } = new URL(request.url);
  const parsed = availabilityCalendarQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { slug, serviceId, month } = parsed.data;
  const { data: business } = await supabase.from('businesses').select('*').eq('slug', slug).maybeSingle();
  if (!business) return NextResponse.json({ availableDates: [], closedDates: [] });

  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .eq('business_id', business.id)
    .eq('is_active', true)
    .maybeSingle();
  if (!service) return NextResponse.json({ availableDates: [], closedDates: [] });

  const monthStart = startOfMonth(new Date(`${month}-01T00:00:00`));
  const monthEnd = endOfMonth(monthStart);
  const startDate = dayKey(monthStart);
  const endDate = dayKey(monthEnd);

  const { data: weeklyRules } = await supabase
    .from('availability_rules')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false });

  type WeeklyRule = {
    weekday: number;
    start_time: string;
    end_time: string;
    breaks: { start: string; end: string }[];
  };

  const weeklyRulesByDay = new Map<number, WeeklyRule>();
  for (const rule of weeklyRules ?? []) {
    if (!weeklyRulesByDay.has(rule.weekday)) {
      weeklyRulesByDay.set(rule.weekday, rule);
    }
  }

  const { data: exceptions } = await supabase
    .from('availability_exceptions')
    .select('*')
    .eq('business_id', business.id)
    .gte('date', startDate)
    .lte('date', endDate);

  const exceptionsByDate = new Map((exceptions ?? []).map((item) => [item.date, item]));

  const { data: bookings } = await supabase
    .from('bookings')
    .select('start_at,end_at')
    .eq('business_id', business.id)
    .eq('status', 'confirmed')
    .gte('start_at', new Date(`${startDate}T00:00:00.000Z`).toISOString())
    .lte('start_at', new Date(`${endDate}T23:59:59.999Z`).toISOString());

  const bookingsByDate = new Map<string, { start_at: string; end_at: string }[]>();
  for (const booking of bookings ?? []) {
    const key = dayKey(new Date(booking.start_at));
    const list = bookingsByDate.get(key) ?? [];
    list.push(booking);
    bookingsByDate.set(key, list);
  }

  const availableDates: string[] = [];
  const closedDates: string[] = [];

  for (let current = new Date(monthStart); current <= monthEnd; current.setDate(current.getDate() + 1)) {
    const date = dayKey(current);
    const weekday = current.getDay();
    const weeklyRule = weeklyRulesByDay.get(weekday) ?? null;
    const exception = exceptionsByDate.get(date) ?? null;

    const slots = generateSlots({
      date,
      timezone: business.timezone,
      serviceDurationMinutes: service.duration_minutes,
      weeklyRule: weeklyRule
        ? {
            start_time: weeklyRule.start_time,
            end_time: weeklyRule.end_time,
            breaks: weeklyRule.breaks,
          }
        : null,
      exception: exception
        ? {
            is_closed: exception.is_closed,
            start_time: exception.start_time,
            end_time: exception.end_time,
            breaks: exception.breaks,
          }
        : null,
      existingBookings: bookingsByDate.get(date) ?? [],
    });

    if (slots.length > 0) {
      availableDates.push(date);
    } else {
      closedDates.push(date);
    }
  }

  return NextResponse.json({ availableDates, closedDates });
}
