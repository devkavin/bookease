'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function AvailabilityPage() {
  const supabase = createClient();
  const qc = useQueryClient();
  const [weekday, setWeekday] = useState('1');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('17:00');
  const [exceptionDate, setExceptionDate] = useState('');
  const rules = useQuery({ queryKey: ['rules'], queryFn: async () => (await supabase.from('availability_rules').select('*').order('weekday')).data ?? [] });
  const exceptions = useQuery({ queryKey: ['exceptions'], queryFn: async () => (await supabase.from('availability_exceptions').select('*').order('date', { ascending: false })).data ?? [] });
  const addRule = useMutation({ mutationFn: async () => supabase.from('availability_rules').insert({ weekday: Number(weekday), start_time: start, end_time: end, breaks: [] }), onSuccess: () => qc.invalidateQueries({ queryKey: ['rules'] }) });
  const addException = useMutation({ mutationFn: async () => supabase.from('availability_exceptions').insert({ date: exceptionDate, is_closed: true, breaks: [] }), onSuccess: () => qc.invalidateQueries({ queryKey: ['exceptions'] }) });

  return <div className="space-y-4"><h1 className="text-2xl">Availability</h1><div className="grid grid-cols-4 gap-2"><Input value={weekday} onChange={(e)=>setWeekday(e.target.value)} /><Input value={start} onChange={(e)=>setStart(e.target.value)} /><Input value={end} onChange={(e)=>setEnd(e.target.value)} /><Button onClick={()=>addRule.mutate()}>Add weekly rule</Button></div><div className="space-y-2">{rules.data?.map((r:any)=><div key={r.id} className="rounded-xl border border-white/10 p-2">Day {r.weekday}: {r.start_time}-{r.end_time}</div>)}</div><div className="grid grid-cols-2 gap-2"><Input type="date" value={exceptionDate} onChange={(e)=>setExceptionDate(e.target.value)} /><Button onClick={()=>addException.mutate()} disabled={!exceptionDate}>Add closed-day exception</Button></div><div className="space-y-2">{exceptions.data?.map((x:any)=><div key={x.id} className="rounded-xl border border-white/10 p-2">{x.date}: {x.is_closed ? 'Closed' : `${x.start_time}-${x.end_time}`}</div>)}</div></div>;
}
