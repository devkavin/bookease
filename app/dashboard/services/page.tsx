'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function ServicesPage() {
  const supabase = createClient();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('30');
  const [price, setPrice] = useState('0');
  const { data } = useQuery({ queryKey: ['services'], queryFn: async () => (await supabase.from('services').select('*').order('created_at')).data ?? [] });
  const create = useMutation({ mutationFn: async () => supabase.from('services').insert({ name, duration_minutes: Number(duration), price_cents: Number(price) }), onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }) });
  const remove = useMutation({ mutationFn: async (id: string) => supabase.from('services').delete().eq('id', id), onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }) });
  return <div><h1 className="mb-4 text-2xl">Services</h1><div className="mb-4 grid grid-cols-4 gap-2"><Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name"/><Input value={duration} onChange={(e)=>setDuration(e.target.value)} placeholder="Minutes"/><Input value={price} onChange={(e)=>setPrice(e.target.value)} placeholder="Price cents"/><Button onClick={()=>create.mutate()}>Add</Button></div><div className="space-y-2">{(data ?? []).map((s:any)=><div key={s.id} className="flex items-center justify-between rounded-xl border border-white/10 p-3"><p>{s.name} · {s.duration_minutes}m · ${(s.price_cents/100).toFixed(2)}</p><Button variant="outline" onClick={()=>remove.mutate(s.id)}>Delete</Button></div>)}</div></div>;
}
