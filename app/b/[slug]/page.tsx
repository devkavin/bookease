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
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState('');
  const [date, setDate] = useState(getTodayKey());
  const [slots, setSlots] = useState<{ label: string; startISO: string }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
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
    async function loadServices() {
      setServicesLoading(true);
      setServicesError('');
      try {
        const res = await fetch(`/api/bookings?slug=${encodeURIComponent(params.slug)}`);
        const d = await res.json();
        if (!res.ok) {
          setServicesError(d.error ?? 'Unable to load services right now.');
          return;
        }
        const loaded = (d.services ?? []) as Service[];
        setServices(loaded);
        if (loaded[0]) setServiceId(loaded[0].id);
      } catch {
        setServicesError('Unable to load services right now.');
      } finally {
        setServicesLoading(false);
      }
    }

    loadServices();
  }, [params.slug]);

  useEffect(() => {
    if (!serviceId) return;

    async function loadSlots() {
      setSlotsLoading(true);
      setSelectedSlot('');
      setStartTime('');
      const res = await fetch(
        `/api/availability?slug=${encodeURIComponent(params.slug)}&serviceId=${serviceId}&date=${date}`
      );
      const d = await res.json();
      setSlots(d.slots ?? []);
      setSlotsLoading(false);
    }

    loadSlots();
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
          {servicesLoading ? <p className="text-sm text-white/60">Loading services…</p> : null}
          {servicesError ? <p className="text-sm text-rose-300">{servicesError}</p> : null}
          <select
            className="w-full rounded-xl border border-white/15 bg-white/5 p-3"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            disabled={servicesLoading || services.length === 0}
          >
            {services.length === 0 ? <option value="">No services available</option> : null}
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
            {slotsLoading ? <p className="text-xs text-white/60">Loading available times…</p> : null}
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

        <Button onClick={confirm} disabled={!startTime || !name || !email || submitting || !serviceId}>
          {submitting ? 'Confirming…' : 'Confirm booking'}
        </Button>
      </Card>
    </main>
  );
}
