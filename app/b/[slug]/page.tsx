'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { BookingCalendar } from '@/components/app/BookingCalendar';
import { TimeSlotGrid } from '@/components/app/TimeSlotGrid';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

export default function PublicBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState(getTodayKey());
  const [slots, setSlots] = useState<{ label: string; startISO: string }[]>([]);
  const [startTime, setStartTime] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');
  const [visibleMonth, setVisibleMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [closedDates, setClosedDates] = useState<string[]>([]);

  const selectedService = useMemo(() => services.find((s) => s.id === serviceId), [serviceId, services]);

  useEffect(() => {
    async function loadServices() {
      setError('');
      setLoadingServices(true);

      try {
        const res = await fetch(`/api/bookings?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error('Unable to load services right now.');
        }

        const loaded = (data.services ?? []) as Service[];
        setServices(loaded);
        setServiceId(loaded[0]?.id ?? '');
      } catch {
        setServices([]);
        setServiceId('');
        setError('Services are currently unavailable. Please try again shortly.');
      } finally {
        setLoadingServices(false);
      }
    }

    loadServices();
  }, [slug]);

  useEffect(() => {
    async function loadSlots() {
      if (!serviceId) {
        setSlots([]);
        setStartTime('');
        setSelectedSlot('');
        return;
      }

      setLoadingSlots(true);
      setError('');

      try {
        const res = await fetch(
          `/api/availability?slug=${encodeURIComponent(slug)}&serviceId=${serviceId}&date=${date}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error('Unable to load availability right now.');
        }

        setSlots(data.slots ?? []);
        setStartTime('');
        setSelectedSlot('');
      } catch {
        setSlots([]);
        setError('Could not fetch available time slots. Please try a different date.');
      } finally {
        setLoadingSlots(false);
      }
    }

    loadSlots();
  }, [serviceId, date, slug]);

  useEffect(() => {
    async function loadCalendarSummary() {
      if (!serviceId) {
        setAvailableDates([]);
        setClosedDates([]);
        return;
      }

      try {
        const res = await fetch(
          `/api/availability/calendar?slug=${encodeURIComponent(slug)}&serviceId=${serviceId}&month=${visibleMonth}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error('Unable to load calendar availability.');
        }

        setAvailableDates(data.availableDates ?? []);
        setClosedDates(data.closedDates ?? []);
      } catch {
        setAvailableDates([]);
        setClosedDates([]);
      }
    }

    loadCalendarSummary();
  }, [serviceId, slug, visibleMonth]);

  async function confirm() {
    if (!serviceId || !startTime || !name || !email || !phone) return;

    setSubmitting(true);
    setError('');

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        serviceId,
        date,
        startTime,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
      }),
    });
    const json = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(typeof json.error === 'string' ? json.error : 'Unable to confirm your booking. Please try again.');
      return;
    }

    if (json.bookingId) {
      window.location.href = `/b/${slug}/confirmed?bookingId=${json.bookingId}`;
    }
  }

  const steps = [
    { title: 'Choose service', done: Boolean(serviceId) },
    { title: 'Pick date & time', done: Boolean(startTime) },
    { title: 'Your details', done: Boolean(name && email && phone) },
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
          <Select value={serviceId} onValueChange={setServiceId} disabled={loadingServices || services.length === 0}>
            <SelectTrigger>
              <SelectValue
                placeholder={
                  loadingServices
                    ? 'Loading services...'
                    : services.length === 0
                      ? 'No services available'
                      : 'Select a service'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} · {s.duration_minutes} min
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">2) Date</h2>
            <BookingCalendar
              value={date}
              onChange={setDate}
              availableDates={availableDates}
              closedDates={closedDates}
              onMonthChange={setVisibleMonth}
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Time slots</h2>
            <p className="text-xs text-white/60">
              {selectedService ? `${selectedService.duration_minutes}-minute appointment` : 'Select a service'}
            </p>
            <p className="text-xs text-white/50">Choose a time from the segmented picker for a faster selection flow.</p>
            {loadingSlots ? <p className="text-xs text-white/70">Loading time slots...</p> : null}
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
            <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Your email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input
              placeholder="Contact number (+14155552671)"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="sm:col-span-2"
            />
          </div>
          <p className="text-xs text-white/60">Include country code to receive booking updates.</p>
        </section>

        {error ? <p className="text-sm text-rose-300">{error}</p> : null}

        <Button
          onClick={confirm}
          disabled={!serviceId || !startTime || !name || !email || !phone || submitting || loadingServices}
        >
          {submitting ? 'Confirming…' : 'Confirm booking'}
        </Button>
      </Card>
    </main>
  );
}
