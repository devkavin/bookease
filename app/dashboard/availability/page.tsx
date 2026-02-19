'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AvailabilityPage() {
  const supabase = createClient();
  const qc = useQueryClient();

  const [weekday, setWeekday] = useState('1');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('17:00');
  const [exceptionDate, setExceptionDate] = useState('');

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

  const rules = useQuery({
    queryKey: ['rules', business.data?.id],
    queryFn: async () => {
      if (!business.data?.id) return [];

      const { data } = await supabase
        .from('availability_rules')
        .select('*')
        .eq('business_id', business.data.id)
        .order('weekday');

      return data ?? [];
    },
    enabled: !!business.data?.id,
  });

  const exceptions = useQuery({
    queryKey: ['exceptions', business.data?.id],
    queryFn: async () => {
      if (!business.data?.id) return [];

      const { data } = await supabase
        .from('availability_exceptions')
        .select('*')
        .eq('business_id', business.data.id)
        .order('date', { ascending: false });

      return data ?? [];
    },
    enabled: !!business.data?.id,
  });

  const addRule = useMutation({
    mutationFn: async () => {
      if (!business.data?.id) {
        throw new Error('No business found for this account.');
      }

      return supabase.from('availability_rules').insert({
        business_id: business.data.id,
        weekday: Number(weekday),
        start_time: start,
        end_time: end,
        breaks: [],
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rules'] }),
  });

  const addException = useMutation({
    mutationFn: async () => {
      if (!business.data?.id) {
        throw new Error('No business found for this account.');
      }

      return supabase.from('availability_exceptions').insert({
        business_id: business.data.id,
        date: exceptionDate,
        is_closed: true,
        breaks: [],
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exceptions'] }),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl">Availability</h1>

      {!business.data?.id ? (
        <p className="text-sm text-muted-foreground">
          Create your business profile first to manage availability.
        </p>
      ) : null}

      <div className="grid grid-cols-4 gap-2">
        <Input value={weekday} onChange={(e) => setWeekday(e.target.value)} />
        <Input value={start} onChange={(e) => setStart(e.target.value)} />
        <Input value={end} onChange={(e) => setEnd(e.target.value)} />
        <Button onClick={() => addRule.mutate()} disabled={!business.data?.id}>
          Add weekly rule
        </Button>
      </div>

      <div className="space-y-2">
        {rules.data?.map((r: any) => (
          <div key={r.id} className="rounded-xl border border-white/10 p-2">
            Day {r.weekday}: {r.start_time}-{r.end_time}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input
          type="date"
          value={exceptionDate}
          onChange={(e) => setExceptionDate(e.target.value)}
        />
        <Button
          onClick={() => addException.mutate()}
          disabled={!exceptionDate || !business.data?.id}
        >
          Add closed-day exception
        </Button>
      </div>

      <div className="space-y-2">
        {exceptions.data?.map((x: any) => (
          <div key={x.id} className="rounded-xl border border-white/10 p-2">
            {x.date}: {x.is_closed ? 'Closed' : `${x.start_time}-${x.end_time}`}
          </div>
        ))}
      </div>
    </div>
  );
}
