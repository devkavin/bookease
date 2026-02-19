'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';

const weekdays = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
] as const;

type AvailabilityRule = {
  id: string;
  weekday: number;
  start_time: string;
  end_time: string;
};

type AvailabilityException = {
  id: string;
  date: string;
  is_closed: boolean;
  start_time: string | null;
  end_time: string | null;
};

type DayDraft = {
  enabled: boolean;
  start: string;
  end: string;
};

const defaultDraft: DayDraft = {
  enabled: false,
  start: '09:00',
  end: '17:00',
};

export default function AvailabilityPage() {
  const supabase = createClient();
  const qc = useQueryClient();

  const [dayDrafts, setDayDrafts] = useState<Record<number, DayDraft>>(() =>
    weekdays.reduce<Record<number, DayDraft>>((acc, day) => {
      acc[day.value] = { ...defaultDraft };
      return acc;
    }, {})
  );

  const [exceptionDraft, setExceptionDraft] = useState({
    date: '',
    is_closed: true,
    start_time: '09:00',
    end_time: '17:00',
  });
  const [formError, setFormError] = useState('');

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
    queryFn: async (): Promise<AvailabilityRule[]> => {
      if (!business.data?.id) return [];

      const { data, error } = await supabase
        .from('availability_rules')
        .select('id,weekday,start_time,end_time')
        .eq('business_id', business.data.id)
        .order('weekday');

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!business.data?.id,
  });

  const exceptions = useQuery({
    queryKey: ['exceptions', business.data?.id],
    queryFn: async (): Promise<AvailabilityException[]> => {
      if (!business.data?.id) return [];

      const { data, error } = await supabase
        .from('availability_exceptions')
        .select('id,date,is_closed,start_time,end_time')
        .eq('business_id', business.data.id)
        .order('date', { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!business.data?.id,
  });

  useEffect(() => {
    if (!rules.data) return;

    const next = weekdays.reduce<Record<number, DayDraft>>((acc, day) => {
      const matching = rules.data.find((rule) => rule.weekday === day.value);
      acc[day.value] = matching
        ? {
            enabled: true,
            start: matching.start_time,
            end: matching.end_time,
          }
        : { ...defaultDraft };
      return acc;
    }, {});

    setDayDrafts(next);
  }, [rules.data]);

  const saveWeekly = useMutation({
    mutationFn: async () => {
      if (!business.data?.id) throw new Error('No business profile found.');
      setFormError('');

      const existingRulesByDay = new Map<number, AvailabilityRule>();
      (rules.data ?? []).forEach((rule) => {
        if (!existingRulesByDay.has(rule.weekday)) {
          existingRulesByDay.set(rule.weekday, rule);
        }
      });

      for (const day of weekdays) {
        const draft = dayDrafts[day.value];
        const existing = existingRulesByDay.get(day.value);

        if (draft.enabled && draft.start >= draft.end) {
          throw new Error(`${day.label}: start time must be earlier than end time.`);
        }

        if (!draft.enabled && existing) {
          await supabase.from('availability_rules').delete().eq('id', existing.id);
          continue;
        }

        if (draft.enabled && existing) {
          await supabase
            .from('availability_rules')
            .update({ start_time: draft.start, end_time: draft.end, breaks: [] })
            .eq('id', existing.id);
          continue;
        }

        if (draft.enabled && !existing) {
          await supabase.from('availability_rules').insert({
            business_id: business.data.id,
            weekday: day.value,
            start_time: draft.start,
            end_time: draft.end,
            breaks: [],
          });
        }
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['rules'] });
    },
    onError: (error: Error) => setFormError(error.message),
  });

  const addException = useMutation({
    mutationFn: async () => {
      if (!business.data?.id) throw new Error('No business profile found.');
      setFormError('');

      if (!exceptionDraft.date) {
        throw new Error('Please select a date for the exception.');
      }

      if (!exceptionDraft.is_closed && exceptionDraft.start_time >= exceptionDraft.end_time) {
        throw new Error('Exception hours are invalid: start time must be earlier than end time.');
      }

      const payload = {
        business_id: business.data.id,
        date: exceptionDraft.date,
        is_closed: exceptionDraft.is_closed,
        start_time: exceptionDraft.is_closed ? null : exceptionDraft.start_time,
        end_time: exceptionDraft.is_closed ? null : exceptionDraft.end_time,
        breaks: [],
      };

      const existingForDate = (exceptions.data ?? []).find((item) => item.date === exceptionDraft.date);

      if (existingForDate) {
        const { error } = await supabase
          .from('availability_exceptions')
          .update(payload)
          .eq('id', existingForDate.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('availability_exceptions').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: async () => {
      setExceptionDraft({
        date: '',
        is_closed: true,
        start_time: '09:00',
        end_time: '17:00',
      });
      await qc.invalidateQueries({ queryKey: ['exceptions'] });
    },
    onError: (error: Error) => setFormError(error.message),
  });

  const deleteException = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('availability_exceptions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['exceptions'] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Availability</h1>
        <p className="mt-1 text-sm text-white/70">
          Set your recurring weekly schedule and add one-off date exceptions.
        </p>
      </div>

      {!business.data?.id ? (
        <Card className="p-4 text-sm text-muted-foreground">
          Create your business profile first to manage availability.
        </Card>
      ) : null}

      {formError ? <p className="text-sm text-rose-300">{formError}</p> : null}

      <Card className="space-y-4 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Weekly hours</h2>
          <Button
            onClick={() => saveWeekly.mutate()}
            disabled={!business.data?.id || saveWeekly.isPending}
          >
            {saveWeekly.isPending ? 'Saving…' : 'Save schedule'}
          </Button>
        </div>

        <div className="space-y-3">
          {weekdays.map((day) => {
            const draft = dayDrafts[day.value];

            return (
              <div
                key={day.value}
                className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:grid-cols-[140px_130px_1fr] sm:items-center sm:gap-4"
              >
                <p className="text-sm font-medium tracking-[0.01em]">{day.label}</p>
                <Button
                  variant={draft.enabled ? 'default' : 'outline'}
                  onClick={() =>
                    setDayDrafts((prev) => ({
                      ...prev,
                      [day.value]: { ...prev[day.value], enabled: !prev[day.value].enabled },
                    }))
                  }
                  className="w-full sm:w-auto"
                >
                  {draft.enabled ? 'Open' : 'Closed'}
                </Button>
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.14em] text-white/55">Opens</p>
                    <Input
                      type="time"
                      value={draft.start}
                      disabled={!draft.enabled}
                      onChange={(e) =>
                        setDayDrafts((prev) => ({
                          ...prev,
                          [day.value]: { ...prev[day.value], start: e.target.value },
                        }))
                      }
                    />
                  </div>
                  <span className="hidden px-1 text-center text-xs font-medium uppercase tracking-[0.14em] text-white/45 sm:block">
                    to
                  </span>
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.14em] text-white/55">Closes</p>
                    <Input
                      type="time"
                      value={draft.end}
                      disabled={!draft.enabled}
                      onChange={(e) =>
                        setDayDrafts((prev) => ({
                          ...prev,
                          [day.value]: { ...prev[day.value], end: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="space-y-4 p-4 sm:p-6">
        <h2 className="text-lg font-semibold">Date exceptions</h2>

        <div className="grid gap-3 sm:grid-cols-4 sm:items-end">
          <DatePicker
            value={exceptionDraft.date}
            onChange={(date) => setExceptionDraft((prev) => ({ ...prev, date }))}
            placeholder="Select exception date"
          />
          <Button
            variant={exceptionDraft.is_closed ? 'default' : 'outline'}
            onClick={() => setExceptionDraft((prev) => ({ ...prev, is_closed: !prev.is_closed }))}
          >
            {exceptionDraft.is_closed ? 'Closed all day' : 'Custom hours'}
          </Button>
          <Input
            type="time"
            value={exceptionDraft.start_time}
            disabled={exceptionDraft.is_closed}
            aria-label="Exception start time"
            onChange={(e) => setExceptionDraft((prev) => ({ ...prev, start_time: e.target.value }))}
          />
          <Input
            type="time"
            value={exceptionDraft.end_time}
            disabled={exceptionDraft.is_closed}
            aria-label="Exception end time"
            onChange={(e) => setExceptionDraft((prev) => ({ ...prev, end_time: e.target.value }))}
          />
        </div>

        <Button
          onClick={() => addException.mutate()}
          disabled={!business.data?.id || addException.isPending}
        >
          {addException.isPending ? 'Saving…' : 'Save exception'}
        </Button>

        <div className="space-y-2">
          {(exceptions.data ?? []).length === 0 ? (
            <p className="text-sm text-white/70">No exceptions added yet.</p>
          ) : (
            exceptions.data?.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 p-3 text-sm">
                <p>
                  <span className="font-medium">{item.date}</span> ·{' '}
                  {item.is_closed ? 'Closed' : `${item.start_time} to ${item.end_time}`}
                </p>
                <Button
                  variant="outline"
                  onClick={() => deleteException.mutate(item.id)}
                  disabled={deleteException.isPending}
                >
                  Delete
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
