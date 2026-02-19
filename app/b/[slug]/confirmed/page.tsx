import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ConfirmedPage({ searchParams }: { searchParams: { bookingId?: string } }) {
  const bookingId = searchParams.bookingId;
  return <main className="mx-auto max-w-xl px-4 py-20 text-center"><h1 className="text-4xl">Booking confirmed</h1><p className="mt-4 text-white/70">Your appointment is secured.</p>{bookingId && <Link href={`/api/bookings/${bookingId}/ics`}><Button className="mt-6">Download .ics</Button></Link>}</main>;
}
