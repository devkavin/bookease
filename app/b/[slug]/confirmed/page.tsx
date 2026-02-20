'use client';

import Link from 'next/link';
import { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type BookingDetails = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  start_at: string;
  end_at: string;
  note: string | null;
  services: { name: string } | null;
  businesses: { name: string; slug: string } | null;
};

const REDIRECT_SECONDS = 15;

export default function ConfirmedPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: { bookingId?: string };
}) {
  const { slug } = use(params);
  const router = useRouter();
  const bookingId = searchParams.bookingId;
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(Boolean(bookingId));
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  const fallbackHref = useMemo(() => `/b/${slug}`, [slug]);

  useEffect(() => {
    if (!bookingId) return;

    async function loadBookingDetails() {
      setLoading(true);
      const res = await fetch(`/api/bookings/${bookingId}?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (res.ok) {
        setBooking(data.booking);
      }
      setLoading(false);
    }

    loadBookingDetails();
  }, [bookingId, slug]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          const canGoBack = typeof window !== 'undefined' && window.history.length > 1;
          if (canGoBack) {
            router.back();
          } else {
            router.push(fallbackHref);
          }
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fallbackHref, router]);

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-14">
      <Card className="space-y-6 border-emerald-400/30 bg-emerald-500/10 p-6 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Confirmed</p>
        <h1 className="text-3xl font-semibold">Your booking is secured 🎉</h1>
        <p className="text-sm text-white/80">
          Redirecting in <span className="font-semibold text-emerald-200">{secondsLeft}s</span>.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button onClick={() => router.push(fallbackHref)}>Add another booking</Button>
          <Button variant="outline" onClick={() => router.back()}>
            Go back now
          </Button>
          {bookingId ? (
            <Link href={`/api/bookings/${bookingId}/ics`}>
              <Button variant="outline">Download .ics</Button>
            </Link>
          ) : null}
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="text-xl font-semibold">Booking details</h2>
        {loading ? <p className="text-sm text-white/70">Loading details…</p> : null}
        {!loading && !booking ? (
          <p className="text-sm text-white/70">Booking details are not available right now.</p>
        ) : null}
        {booking ? (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-white/60">Business</dt>
              <dd>{booking.businesses?.name}</dd>
            </div>
            <div>
              <dt className="text-white/60">Service</dt>
              <dd>{booking.services?.name}</dd>
            </div>
            <div>
              <dt className="text-white/60">Customer</dt>
              <dd>{booking.customer_name}</dd>
            </div>
            <div>
              <dt className="text-white/60">Email</dt>
              <dd>{booking.customer_email}</dd>
            </div>
            <div>
              <dt className="text-white/60">Contact number</dt>
              <dd>{booking.customer_phone}</dd>
            </div>
            <div>
              <dt className="text-white/60">Time</dt>
              <dd>{new Date(booking.start_at).toLocaleString()}</dd>
            </div>
          </dl>
        ) : null}
      </Card>
    </main>
  );
}
