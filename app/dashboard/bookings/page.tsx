'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
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
  status: string;
};

export default function BookingsPage() {
  const supabase = createClient();
  const qc = useQueryClient();
  const [query, setQuery] = useState('');

  const bookings = useQuery({
    queryKey: ['bookings'],
    queryFn: async (): Promise<Booking[]> => {
      const { data, error } = await supabase
        .from('bookings')
        .select('id,customer_name,customer_email,customer_phone,start_at,status')
        .order('start_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
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

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return bookings.data ?? [];

    return (bookings.data ?? []).filter(
      (booking) =>
        booking.customer_name.toLowerCase().includes(normalized) ||
        booking.customer_email.toLowerCase().includes(normalized)
    );
  }, [query, bookings.data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Bookings</h1>
          <p className="mt-1 text-sm text-white/70">Track appointments and resolve updates in one place.</p>
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

      <Card className="space-y-2 p-4 sm:p-6">
        {filtered.length === 0 ? (
          <EmptyState
            title="No bookings found"
            message={query ? 'Try a different search term.' : 'Bookings will appear here once clients schedule.'}
          />
        ) : (
          filtered.map((booking) => (
            <div
              key={booking.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3"
            >
              <div>
                <p className="font-medium">
                  {booking.customer_name} · {new Date(booking.start_at).toLocaleString()}
                </p>
                <p className="text-xs text-white/60">
                  {booking.customer_email} · {booking.customer_phone ?? 'No phone'} · {booking.status}
                </p>
              </div>
              {booking.status === 'confirmed' ? (
                <Button variant="outline" onClick={() => cancel.mutate(booking.id)} disabled={cancel.isPending}>
                  Cancel
                </Button>
              ) : null}
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
