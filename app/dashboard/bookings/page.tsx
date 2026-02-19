'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';

export default function BookingsPage() {
  const supabase = createClient();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => (await supabase.from('bookings').select('*').order('start_at', { ascending: false })).data ?? [],
  });

  const cancel = useMutation({
    mutationFn: async (id: string) => supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings'] }),
  });

  return (
    <div>
      <h1 className="mb-4 text-2xl">Bookings</h1>
      <div className="space-y-2">
        {(data ?? []).map((b: any) => (
          <div key={b.id} className="flex items-center justify-between rounded-xl border border-white/10 p-3">
            <div>
              <p>
                {b.customer_name} · {new Date(b.start_at).toLocaleString()}
              </p>
              <p className="text-xs text-white/60">
                {b.customer_email} · {b.customer_phone ?? 'No phone'} · {b.status}
              </p>
            </div>
            {b.status === 'confirmed' && (
              <Button variant="outline" onClick={() => cancel.mutate(b.id)}>
                Cancel
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
