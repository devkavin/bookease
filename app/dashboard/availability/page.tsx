'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/browser';

const WEEKDAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

type WeeklyRule = {
  id: string;
  weekday: number;
  start_time: string;
  end_time: string;
};

type ExceptionRule = {
  id: string;
  date: string;
  is_closed: boolean;
  start_time: string | null;
  end_time: string | null;
};

function formatWeekday(weekday: number) {
  return WEEKDAYS.find((d) => d.value === weekday)?.label ?? `Day ${weekday}`;
}

export default function AvailabilityPage() {
  const supabase = createClient();
  const qc = useQueryClient();

  const [weekday, setWeekday] = useState('1');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('17:00');
  const [exceptionDate, setExceptionDate] = useState('');
  const [exceptionStart, setExceptionStart] = useState('09:00');
  const [exceptionEnd, setExceptionEnd] = useState('17:00');
  const [exceptionClosed, setExceptionClosed] = useState(true);
  const [feedback, setFeedback] = useState('');

  const business = useQuery({
    queryKey: ['my-business'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const { data, error } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const rules = useQuery({
    queryKey: ['rules', business.data?.id],
    queryFn: async () => {
      if (!business.data?.id) return [];
      const { data, error } = await supabase
        .from('availability_rules')
        .select('*')
        .eq('business_id', business.data.id)
        .order('weekday');
      if (error) throw error;
      return (data ?? []) as WeeklyRule[];
    },
    enabled: !!business.data?.id,
  });

  const exceptions = useQuery({
    queryKey: ['exceptions', business.data?.id],
    queryFn: async () => {
      if (!business.data?.id) return [];
      const { data, error } = await supabase
        .from('availability_exceptions')
        .select('*')
        .eq('business_id', business.data.id)
        .order('date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ExceptionRule[];
    },
    enabled: !!business.data?.id,
  });

  const addRule = useMutation({
    mutationFn: async () => {
      if (!business.data?.id) throw new Error('No business found for this account.');
      if (!start || !end || start >= end) throw new Error('Weekly hours must have a valid start and end time.');

      const existingForDay = (rules.data ?? []).find((r) => r.weekday === Number(weekday));
      if (existingForDay) {
        const { error } = await supabase
          .from('availability_rules')
          .update({ start_time: start, end_time: end, breaks: [] })
          .eq('id', existingForDay.id);
        if (error) throw error;
        return;
      }

      const { error } = await supabase.from('availability_rules').insert({
        business_id: business.data.id,
        weekday: Number(weekday),
        start_time: start,
        end_time: end,
        breaks: [],
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      setFeedback('Weekly hours saved.');
      await qc.invalidateQueries({ queryKey: ['rules'] });
    },
    onError: (error) => {
      setFeedback(error instanceof Error ? error.message : 'Unable to save weekly hours.');
    },
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('availability_rules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: async () => {
      setFeedback('Weekly hours removed.');
      await qc.invalidateQueries({ queryKey: ['rules'] });
    },
    onError: (error) => {
      setFeedback(error instanceof Error ? error.message : 'Unable to remove weekly hours.');
    },
  });

  const addException = useMutation({
    mutationFn: async () => {
      if (!business.data?.id) throw new Error('No business found for this account.');
      if (!exceptionDate) throw new Error('Pick a date for the exception.');
      if (!exceptionClosed && (!exceptionStart || !exceptionEnd || exceptionStart >= exceptionEnd)) {
        throw new Error('Custom day hours must have a valid start and end time.');
      }

      const payload = {
        business_id: business.data.id,
        date: exceptionDate,
        is_closed: exceptionClosed,
        start_time: exceptionClosed ? null : exceptionStart,
        end_time: exceptionClosed ? null : exceptionEnd,
        breaks: [],
      };

      const existing = (exceptions.data ?? []).find((x) => x.date === exceptionDate);
      if (existing) {
        const { error } = await supabase.from('availability_exceptions').update(payload).eq('id', existing.id);
        if (error) throw error;
        return;
      }

      const { error } = await supabase.from('availability_exceptions').insert(payload);
      if (error) throw error;
    },
    onSuccess: async () => {
      setFeedback('Date exception saved.');
      setExceptionDate('');
      await qc.invalidateQueries({ queryKey: ['exceptions'] });
    },
    onError: (error) => {
      setFeedback(error instanceof Error ? error.message : 'Unable to save exception.');
    },
  });

  const deleteException = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('availability_exceptions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: async () => {
      setFeedback('Date exception removed.');
      await qc.invalidateQueries({ queryKey: ['exceptions'] });
    },
    onError: (error) => {
      setFeedback(error instanceof Error ? error.message : 'Unable to remove exception.');
    },
  });

  const sortedRules = useMemo(
    () => [...(rules.data ?? [])].sort((a, b) => a.weekday - b.weekday),
    [rules.data]
  );

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Availability</h1>
        <p className="text-sm text-white/70">
          Set weekly working hours and one-off exceptions for holidays, events, or special opening times.
        </p>
      </header>

      {!business.data?.id ? (
        <Card className="p-4 text-sm text-white/70">
          Create your business profile first to manage availability.
        </Card>
      ) : null}

      {feedback ? <p className="text-sm text-sky-300">{feedback}</p> : null}

      <Card className="space-y-4 p-4">
        <h2 className="text-lg font-semibold">Weekly hours</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <label className="space-y-1 text-sm">
            <span className="text-white/70">Weekday</span>
            <select
              className="w-full rounded-xl border border-white/15 bg-white/5 p-2"
              value={weekday}
              onChange={(e) => setWeekday(e.target.value)}
            >
              {WEEKDAYS.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-white/70">Start time</span>
            <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-white/70">End time</span>
            <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
          </label>
          <Button onClick={() => addRule.mutate()} disabled={!business.data?.id || addRule.isPending}>
            {addRule.isPending ? 'Saving…' : 'Save weekday'}
          </Button>
        </div>

        <div className="space-y-2">
          {rules.isLoading ? <p className="text-sm text-white/60">Loading weekly hours…</p> : null}
          {sortedRules.length === 0 && !rules.isLoading ? (
            <p className="text-sm text-white/60">No weekly hours yet.</p>
          ) : null}
          {sortedRules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between rounded-xl border border-white/10 p-3">
              <p className="text-sm">
                <span className="font-medium">{formatWeekday(rule.weekday)}</span> · {rule.start_time.slice(0, 5)}–
                {rule.end_time.slice(0, 5)}
              </p>
              <Button variant="outline" onClick={() => deleteRule.mutate(rule.id)} disabled={deleteRule.isPending}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4 p-4">
        <h2 className="text-lg font-semibold">Date exceptions</h2>
        <div className="grid gap-3 md:grid-cols-5">
          <label className="space-y-1 text-sm md:col-span-2">
            <span className="text-white/70">Date</span>
            <Input
              type="date"
              value={exceptionDate}
              onChange={(e) => setExceptionDate(e.target.value)}
            />
          </label>
          <label className="flex items-end gap-2 text-sm md:col-span-1">
            <input
              type="checkbox"
              checked={exceptionClosed}
              onChange={(e) => setExceptionClosed(e.target.checked)}
            />
            Closed all day
          </label>
          {!exceptionClosed ? (
            <>
              <Input type="time" value={exceptionStart} onChange={(e) => setExceptionStart(e.target.value)} />
              <Input type="time" value={exceptionEnd} onChange={(e) => setExceptionEnd(e.target.value)} />
            </>
          ) : null}
          <Button onClick={() => addException.mutate()} disabled={!business.data?.id || addException.isPending}>
            {addException.isPending ? 'Saving…' : 'Save exception'}
          </Button>
        </div>

        <div className="space-y-2">
          {exceptions.isLoading ? <p className="text-sm text-white/60">Loading exceptions…</p> : null}
          {(exceptions.data ?? []).length === 0 && !exceptions.isLoading ? (
            <p className="text-sm text-white/60">No exceptions yet.</p>
          ) : null}
          {(exceptions.data ?? []).map((x) => (
            <div key={x.id} className="flex items-center justify-between rounded-xl border border-white/10 p-3">
              <p className="text-sm">
                <span className="font-medium">{x.date}</span> ·{' '}
                {x.is_closed ? 'Closed' : `${x.start_time?.slice(0, 5)}–${x.end_time?.slice(0, 5)}`}
              </p>
              <Button
                variant="outline"
                onClick={() => deleteException.mutate(x.id)}
                disabled={deleteException.isPending}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
