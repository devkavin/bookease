import { NextResponse } from 'next/server';
import { createClient as createAdmin } from '@supabase/supabase-js';
import { createEvent } from 'ics';

const supabase = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const { data: booking } = await supabase.from('bookings').select('*, businesses(name), services(name)').eq('id', id).single();
  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const start = new Date(booking.start_at);
  const end = new Date(booking.end_at);
  const { error, value } = createEvent({
    title: `${booking.businesses.name} · ${booking.services.name}`,
    start: [start.getUTCFullYear(), start.getUTCMonth() + 1, start.getUTCDate(), start.getUTCHours(), start.getUTCMinutes()],
    end: [end.getUTCFullYear(), end.getUTCMonth() + 1, end.getUTCDate(), end.getUTCHours(), end.getUTCMinutes()],
    description: `Booking for ${booking.customer_name}`
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return new NextResponse(value, { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': `attachment; filename=booking-${id}.ics` } });
}
