'use client';
import { useEffect, useState } from 'react';
import { DatePicker } from '@/components/app/DatePicker';
import { TimeSlotGrid } from '@/components/app/TimeSlotGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PublicBookingPage({ params }: { params: { slug: string } }) {
  const [services, setServices] = useState<any[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState<any[]>([]);
  const [startTime, setStartTime] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetch(`/api/bookings?slug=${params.slug}`).then((r) => r.json()).then((d) => { setServices(d.services ?? []); if (d.services?.[0]) setServiceId(d.services[0].id); });
  }, [params.slug]);

  useEffect(() => {
    if (!serviceId) return;
    fetch(`/api/availability?slug=${params.slug}&serviceId=${serviceId}&date=${date}`).then((r) => r.json()).then((d) => setSlots(d.slots ?? []));
  }, [serviceId, date, params.slug]);

  async function confirm() {
    const res = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: params.slug, serviceId, date, startTime, customer_name: name, customer_email: email }) });
    const json = await res.json();
    if (json.bookingId) window.location.href = `/b/${params.slug}/confirmed?bookingId=${json.bookingId}`;
  }

  return <main className="mx-auto max-w-2xl space-y-4 px-4 py-12"><h1 className="text-3xl font-semibold">Book appointment</h1><select className="w-full rounded-xl bg-white/10 p-2" value={serviceId} onChange={(e)=>setServiceId(e.target.value)}>{services.map((s)=><option key={s.id} value={s.id}>{s.name} · {s.duration_minutes} min</option>)}</select><DatePicker value={date} onChange={setDate} /><TimeSlotGrid slots={slots} value={selectedSlot} onSelect={(slot)=>{ setSelectedSlot(slot.startISO); setStartTime(slot.label); }} /><Input placeholder="Your name" value={name} onChange={(e)=>setName(e.target.value)} /><Input placeholder="Your email" value={email} onChange={(e)=>setEmail(e.target.value)} /><Button onClick={confirm} disabled={!startTime || !name || !email}>Confirm booking</Button></main>;
}
