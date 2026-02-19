'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock3, DollarSign, Plus, Search, Sparkles, Trash2, WandSparkles } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/app/EmptyState';
import { formatCurrency } from '@/lib/currency';

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
};

const presets: Array<{ name: string; duration: number; priceCents: number }> = [
  { name: 'Intro consultation', duration: 30, priceCents: 0 },
  { name: 'Standard session', duration: 60, priceCents: 7500 },
  { name: 'Deep dive package', duration: 90, priceCents: 12900 },
];

export default function ServicesPage() {
  const supabase = createClient();
  const qc = useQueryClient();

  const [name, setName] = useState('');
  const [duration, setDuration] = useState('30');
  const [price, setPrice] = useState('0');
  const [query, setQuery] = useState('');

  const business = useQuery({
    queryKey: ['my-business'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const { data, error } = await supabase
        .from('businesses')
        .select('id,system_currency')
        .eq('owner_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const services = useQuery({
    queryKey: ['services', business.data?.id],
    queryFn: async (): Promise<Service[]> => {
      if (!business.data?.id) return [];

      const { data, error } = await supabase
        .from('services')
        .select('id,name,duration_minutes,price_cents')
        .eq('business_id', business.data.id)
        .order('created_at');

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!business.data?.id,
  });

  const create = useMutation({
    mutationFn: async ({
      nextName,
      nextDuration,
      nextPrice,
    }: {
      nextName: string;
      nextDuration: number;
      nextPrice: number;
    }) => {
      if (!business.data?.id) {
        throw new Error('No business found for this account.');
      }

      const { error } = await supabase.from('services').insert({
        business_id: business.data.id,
        name: nextName,
        duration_minutes: nextDuration,
        price_cents: nextPrice,
      });

      if (error) throw error;
    },
    onSuccess: async () => {
      setName('');
      setDuration('30');
      setPrice('0');
      await qc.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service added.');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service deleted.');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const totalServices = (services.data ?? []).length;
  const averageDuration =
    totalServices > 0
      ? Math.round((services.data ?? []).reduce((sum, item) => sum + item.duration_minutes, 0) / totalServices)
      : 0;

  const averagePrice =
    totalServices > 0
      ? (services.data ?? []).reduce((sum, item) => sum + item.price_cents, 0) / totalServices / 100
      : 0;

  const filteredServices = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return services.data ?? [];

    return (services.data ?? []).filter((item) => item.name.toLowerCase().includes(normalized));
  }, [query, services.data]);

  const submitNewService = () => {
    const nextDuration = Number(duration);
    const nextPrice = Math.round(Number(price) * 100);

    if (!name.trim()) {
      toast.error('Please add a service name.');
      return;
    }

    if (!Number.isFinite(nextDuration) || nextDuration < 5) {
      toast.error('Duration should be at least 5 minutes.');
      return;
    }

    if (!Number.isFinite(nextPrice) || nextPrice < 0) {
      toast.error('Price must be 0 or higher.');
      return;
    }

    create.mutate({
      nextName: name.trim(),
      nextDuration,
      nextPrice,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Services</h1>
          <p className="mt-1 text-sm text-white/70">
            Build a polished service menu that clients can instantly understand and book.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
          <Sparkles className="h-3.5 w-3.5" />
          Booking conversion optimized
        </div>
      </div>

      {!business.data?.id ? (
        <Card className="p-4 text-sm text-muted-foreground">
          Create your business profile first to set up your services.
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-1 p-4">
          <p className="text-sm text-white/70">Active services</p>
          <p className="text-2xl font-semibold">{totalServices}</p>
        </Card>
        <Card className="space-y-1 p-4">
          <p className="text-sm text-white/70">Average duration</p>
          <p className="text-2xl font-semibold">{averageDuration} min</p>
        </Card>
        <Card className="space-y-1 p-4">
          <p className="text-sm text-white/70">Average price</p>
          <p className="text-2xl font-semibold">{formatCurrency(averagePrice, business.data?.system_currency ?? 'USD')}</p>
        </Card>
      </div>

      <Card className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Add a service</h2>
          <div className="inline-flex items-center gap-2 text-xs text-white/70">
            <WandSparkles className="h-3.5 w-3.5" />
            Pro tip: clear names convert better than internal jargon
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1.2fr_0.6fr_0.6fr_auto]">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Service name" />
          <div className="relative">
            <Clock3 className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-white/50" />
            <Input
              type="number"
              min={5}
              step={5}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Minutes"
              className="pl-9"
            />
          </div>
          <div className="relative">
            <DollarSign className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-white/50" />
            <Input
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              className="pl-9"
            />
          </div>
          <Button onClick={submitNewService} disabled={!business.data?.id || create.isPending}>
            <Plus className="mr-1.5 h-4 w-4" />
            {create.isPending ? 'Adding…' : 'Add'}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.name}
              variant="outline"
              onClick={() => {
                setName(preset.name);
                setDuration(String(preset.duration));
                setPrice((preset.priceCents / 100).toFixed(2));
              }}
            >
              {preset.name}
            </Button>
          ))}
        </div>
      </Card>

      <Card className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Service catalog</h2>
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-white/50" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services"
              className="pl-9"
            />
          </div>
        </div>

        {filteredServices.length === 0 ? (
          <EmptyState
            title="No services found"
            message={
              totalServices === 0
                ? 'Start by adding your first service. You can use presets to move faster.'
                : 'Try another keyword or clear your search.'
            }
          />
        ) : (
          <div className="space-y-2">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3"
              >
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-xs text-white/60">
                    {service.duration_minutes} min · {formatCurrency(
                      service.price_cents / 100,
                      business.data?.system_currency ?? 'USD'
                    )}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => remove.mutate(service.id)}
                  disabled={remove.isPending}
                >
                  <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
