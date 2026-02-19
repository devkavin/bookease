'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ServicesPage() {
  const supabase = createClient();
  const qc = useQueryClient();

  const [name, setName] = useState('');
  const [duration, setDuration] = useState('30');
  const [price, setPrice] = useState('0');

  const business = useQuery({
    queryKey: ['my-business'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const { data } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      return data;
    },
  });

  const services = useQuery({
    queryKey: ['services', business.data?.id],
    queryFn: async () => {
      if (!business.data?.id) return [];

      const { data } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', business.data.id)
        .order('created_at');

      return data ?? [];
    },
    enabled: !!business.data?.id,
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!business.data?.id) {
        throw new Error('No business found for this account.');
      }

      return supabase.from('services').insert({
        business_id: business.data.id,
        name,
        duration_minutes: Number(duration),
        price_cents: Number(price),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) =>
      supabase.from('services').delete().eq('id', id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  });

  return (
    <div>
      <h1 className="mb-4 text-2xl">Services</h1>
      <div className="mb-4 grid grid-cols-4 gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <Input
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Minutes"
        />
        <Input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price cents"
        />
        <Button onClick={() => create.mutate()} disabled={!business.data?.id}>
          Add
        </Button>
      </div>

      {!business.data?.id ? (
        <p className="text-sm text-muted-foreground">
          Create your business profile first to add services.
        </p>
      ) : null}

      <div className="space-y-2">
        {(services.data ?? []).map((s: any) => (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-xl border border-white/10 p-3"
          >
            <p>
              {s.name} · {s.duration_minutes}m · ${(s.price_cents / 100).toFixed(2)}
            </p>
            <Button variant="outline" onClick={() => remove.mutate(s.id)}>
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
