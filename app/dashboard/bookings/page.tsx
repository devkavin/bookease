'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, CheckCircle2, Clock, Search, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/app/EmptyState';

type Booking = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  start_at: string;
  status: 'confirmed' | 'cancelled';
};

const filters: Array<{ label: string; value: 'all' | Booking['status'] }> = [
  { label: 'All', value: 'all' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function BookingsPage() {
  const supabase = createClient();
  const qc = useQueryClient();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof filters)[number]['value']>('all');

  const bookings = useQuery({
    queryKey: ['bookings'],
    queryFn: async (): Promise<Booking[]> => {
      const { data, error } = await supabase
        .from('bookings')
        .select('id,customer_name,customer_email,customer_phone,start_at,status')
        .order('start_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as Booking[];
    },
  });

  const cancel = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking cancelled.');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const allBookings = bookings.data ?? [];

  const stats = useMemo(() => {
    const now = Date.now();

    return {
      total: allBookings.length,
      confirmed: allBookings.filter((booking) => booking.status === 'confirmed').length,
      upcoming: allBookings.filter((booking) => booking.status === 'confirmed' && new Date(booking.start_at).getTime() >= now)
        .length,
      cancelled: allBookings.filter((booking) => booking.status === 'cancelled').length,
    };
  }, [allBookings]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return allBookings.filter((booking) => {
      const statusMatches = statusFilter === 'all' ? true : booking.status === statusFilter;
      const queryMatches =
        !normalized ||
        booking.customer_name.toLowerCase().includes(normalized) ||
        booking.customer_email.toLowerCase().includes(normalized);

      return statusMatches && queryMatches;
    });
  }, [allBookings, query, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Bookings</h1>
          <p className="mt-1 text-sm text-white/70">Track appointments, monitor status, and take action instantly.</p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-white/50" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email"
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="space-y-1 p-4">
          <p className="text-xs uppercase tracking-wide text-white/60">Total bookings</p>
          <p className="text-2xl font-semibold">{stats.total}</p>
        </Card>
        <Card className="space-y-1 p-4">
          <p className="text-xs uppercase tracking-wide text-white/60">Confirmed</p>
          <p className="inline-flex items-center gap-1.5 text-2xl font-semibold">
            <CheckCircle2 className="h-5 w-5 text-emerald-300" /> {stats.confirmed}
          </p>
        </Card>
        <Card className="space-y-1 p-4">
          <p className="text-xs uppercase tracking-wide text-white/60">Upcoming</p>
          <p className="inline-flex items-center gap-1.5 text-2xl font-semibold">
            <CalendarClock className="h-5 w-5 text-sky-300" /> {stats.upcoming}
          </p>
        </Card>
        <Card className="space-y-1 p-4">
          <p className="text-xs uppercase tracking-wide text-white/60">Cancelled</p>
          <p className="inline-flex items-center gap-1.5 text-2xl font-semibold">
            <XCircle className="h-5 w-5 text-rose-300" /> {stats.cancelled}
          </p>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const active = statusFilter === filter.value;
          return (
            <Button
              key={filter.value}
              variant={active ? 'default' : 'outline'}
              onClick={() => setStatusFilter(filter.value)}
            >
              {filter.label}
            </Button>
          );
        })}
      </div>

      <Card className="space-y-2 p-4 sm:p-6">
        {filtered.length === 0 ? (
          <EmptyState
            title="No bookings found"
            message={query ? 'Try a different search term.' : 'Bookings will appear here once clients schedule.'}
          />
        ) : (
          filtered.map((booking) => {
            const startAt = new Date(booking.start_at);

            return (
              <div
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3"
              >
                <div className="space-y-1">
                  <p className="font-medium">{booking.customer_name}</p>
                  <p className="text-xs text-white/60">{booking.customer_email} · {booking.customer_phone ?? 'No phone'}</p>
                  <p className="inline-flex items-center gap-1.5 text-xs text-white/70">
                    <Clock className="h-3.5 w-3.5" />
                    {startAt.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-1 text-xs capitalize ${
                      booking.status === 'confirmed'
                        ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100'
                        : 'border-rose-300/30 bg-rose-400/10 text-rose-100'
                    }`}
                  >
                    {booking.status}
                  </span>
                  {booking.status === 'confirmed' ? (
                    <Button variant="outline" onClick={() => cancel.mutate(booking.id)} disabled={cancel.isPending}>
                      Cancel
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </Card>
    </div>
  );
}
