import { NextResponse } from 'next/server';
import { createClient as createAdmin, SupabaseClient } from '@supabase/supabase-js';
import { createEvent } from 'ics';

export const runtime = 'nodejs';

type BookingWithRelations = {
  id: string;
  start_at: string;
  end_at: string;
  customer_name: string;
  businesses: { name: string };
  services: { name: string };
};

function getAdminClient(): SupabaseClient {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase environment variables for ICS generation.');
  }

  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  let supabase: SupabaseClient;

  try {
    supabase = getAdminClient();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to initialize Supabase.';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, start_at, end_at, customer_name, businesses(name), services(name)')
    .eq('id', id)
    .single<BookingWithRelations>();

  if (!booking) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const start = new Date(booking.start_at);
  const end = new Date(booking.end_at);

  const { error, value } = createEvent({
    title: `${booking.businesses.name} · ${booking.services.name}`,
    start: [start.getUTCFullYear(), start.getUTCMonth() + 1, start.getUTCDate(), start.getUTCHours(), start.getUTCMinutes()],
    end: [end.getUTCFullYear(), end.getUTCMonth() + 1, end.getUTCDate(), end.getUTCHours(), end.getUTCMinutes()],
    description: `Booking for ${booking.customer_name}`,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return new NextResponse(value, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename=booking-${id}.ics`,
      'Cache-Control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=3600',
    },
  });
}
