import { NextResponse } from 'next/server';
import { bookingSchema } from '@/lib/validators/booking';
import { createClient as createServer } from '@/lib/supabase/server';
import { createClient as createAdmin, SupabaseClient } from '@supabase/supabase-js';
import { fromZonedTime } from 'date-fns-tz';
import { addMinutes } from 'date-fns';
import { overlaps } from '@/lib/slots/overlap';
import { sendBookingEmail } from '@/lib/email/resend';

function adminClient(): SupabaseClient | null {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function GET(request: Request) {
  const supabase = adminClient() ?? (await createServer());
  const slug = new URL(request.url).searchParams.get('slug');
  if (!slug) return NextResponse.json({ services: [] });

  const { data: business } = await supabase.from('businesses').select('id').eq('slug', slug).maybeSingle();
  if (!business) return NextResponse.json({ services: [] });

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', business.id)
    .eq('is_active', true)
    .order('created_at');

  return NextResponse.json({ services: services ?? [] });
}

export async function POST(request: Request) {
  const parsed = bookingSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { slug, serviceId, date, startTime, customer_name, customer_email, note } = parsed.data;
  const supabase = adminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: 'Booking is temporarily unavailable. Please try again later.' },
      { status: 503 }
    );
  }

  const { data: business } = await supabase.from('businesses').select('*').eq('slug', slug).single();
  if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .eq('business_id', business.id)
    .single();
  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

  const start_at = fromZonedTime(`${date}T${startTime}:00`, business.timezone);
  const end_at = addMinutes(start_at, service.duration_minutes);
  const { data: overlapping } = await supabase
    .from('bookings')
    .select('start_at,end_at')
    .eq('business_id', business.id)
    .eq('status', 'confirmed')
    .lt('start_at', end_at.toISOString())
    .gt('end_at', start_at.toISOString());

  if ((overlapping ?? []).some((b) => overlaps(start_at, end_at, new Date(b.start_at), new Date(b.end_at)))) {
    return NextResponse.json({ error: 'Slot already booked' }, { status: 409 });
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      business_id: business.id,
      service_id: service.id,
      customer_name,
      customer_email,
      start_at: start_at.toISOString(),
      end_at: end_at.toISOString(),
      status: 'confirmed',
      note: note ?? null,
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await sendBookingEmail({
    to: customer_email,
    subject: 'Booking confirmed',
    body: `Your booking for ${service.name} is confirmed on ${start_at.toISOString()}.`,
  });

  return NextResponse.json({ bookingId: booking.id });
}
