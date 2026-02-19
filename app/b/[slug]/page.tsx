'use client';

import { useEffect, useMemo, useState } from 'react';
import { BookingCalendar } from '@/components/app/BookingCalendar';
import { TimeSlotGrid } from '@/components/app/TimeSlotGrid';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
};

function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, '0');
  const d = `${now.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function PublicBookingPage({ params }: { params: { slug: string } }) {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState(getTodayKey());
  const [slots, setSlots] = useState<{ label: string; startISO: string }[]>([]);
  const [startTime, setStartTime] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId),
    [serviceId, services]
  );

  useEffect(() => {
    fetch(`/api/bookings?slug=${params.slug}`)
      .then((r) => r.json())
      .then((d) => {
        const loaded = (d.services ?? []) as Service[];
        setServices(loaded);
        if (loaded[0]) setServiceId(loaded[0].id);
      });
  }, [params.slug]);

  useEffect(() => {
    if (!serviceId) return;
    setSelectedSlot('');
    setStartTime('');
    fetch(`/api/availability?slug=${params.slug}&serviceId=${serviceId}&date=${date}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []));
  }, [serviceId, date, params.slug]);

  async function confirm() {
    setSubmitting(true);
    setError('');
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: params.slug,
        serviceId,
        date,
        startTime,
        customer_name: name,
        customer_email: email,
      }),
    });
    const json = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(json.error ?? 'Unable to confirm your booking. Please try again.');
      return;
    }

    if (json.bookingId) {
      window.location.href = `/b/${params.slug}/confirmed?bookingId=${json.bookingId}`;
    }
  }

  const steps = [
    { title: 'Choose service', done: Boolean(serviceId) },
    { title: 'Pick date & time', done: Boolean(startTime) },
    { title: 'Your details', done: Boolean(name && email) },
  ];

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Book your appointment</h1>
        <p className="text-sm text-white/70">Fast, easy booking in three simple steps.</p>
      </header>

      <div className="grid gap-2 sm:grid-cols-3">
        {steps.map((step, idx) => (
          <Card key={step.title} className="flex items-center gap-3 p-3">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                step.done ? 'bg-sky-500/30 text-sky-100' : 'bg-white/10 text-white/70'
              }`}
            >
              {idx + 1}
            </div>
            <p className="text-sm">{step.title}</p>
          </Card>
        ))}
      </div>

      <Card className="space-y-6 p-5 sm:p-6">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold">1) Service</h2>
          <select
            className="w-full rounded-xl border border-white/15 bg-white/5 p-3"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.duration_minutes} min
              </option>
            ))}
          </select>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">2) Date</h2>
            <BookingCalendar value={date} onChange={setDate} />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Time slots</h2>
            <p className="text-xs text-white/60">
              {selectedService
                ? `${selectedService.duration_minutes}-minute appointment`
                : 'Select a service'}
            </p>
            <TimeSlotGrid
              slots={slots}
              value={selectedSlot}
              onSelect={(slot) => {
                setSelectedSlot(slot.startISO);
                setStartTime(slot.label);
              }}
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">3) Your details</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </section>

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <Button onClick={confirm} disabled={!startTime || !name || !email || submitting}>
          {submitting ? 'Confirming…' : 'Confirm booking'}
        </Button>
      </Card>
    </main>
  );
}
