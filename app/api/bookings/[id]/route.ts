import { NextResponse } from 'next/server';
import { createClient as createAdmin, SupabaseClient } from '@supabase/supabase-js';

function adminClient(): SupabaseClient | null {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = adminClient();
  if (!supabase) return NextResponse.json({ error: 'Unavailable' }, { status: 503 });

  const { id } = await params;
  const slug = new URL(request.url).searchParams.get('slug');

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, customer_name, customer_email, customer_phone, start_at, end_at, note, services(name), businesses(name, slug)')
    .eq('id', id)
    .maybeSingle();

  if (!booking || !booking.businesses) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const business = Array.isArray(booking.businesses) ? booking.businesses[0] : booking.businesses;
  if (slug && business?.slug !== slug) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    booking: {
      ...booking,
      businesses: business,
      services: Array.isArray(booking.services) ? booking.services[0] : booking.services,
    },
  });
}
