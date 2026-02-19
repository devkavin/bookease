'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, LoaderCircle, Save } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/browser';
import { CURRENCY_OPTIONS } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SettingsForm = {
  name: string;
  slug: string;
  timezone: string;
  system_currency: string;
};

const defaultForm: SettingsForm = {
  name: '',
  slug: '',
  timezone: 'Asia/Colombo',
  system_currency: 'USD',
};

export default function SettingsPage() {
  const supabase = createClient();
  const qc = useQueryClient();

  const { data: business } = useQuery({
    queryKey: ['business'],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;

      const { data, error } = await supabase.from('businesses').select('*').eq('owner_id', auth.user.id).single();

      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState<SettingsForm>(defaultForm);

  const hasChanges = useMemo(() => {
    if (!business) return false;

    return (
      form.name !== business.name ||
      form.slug !== business.slug ||
      form.timezone !== business.timezone ||
      form.system_currency !== business.system_currency
    );
  }, [business, form]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!business) {
        throw new Error('Create your business profile before updating settings.');
      }

      const { error } = await supabase.from('businesses').update(form).eq('id', business.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['business'] });
      toast.success('Settings updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });

  useEffect(() => {
    if (!business) return;

    setForm({
      name: business.name,
      slug: business.slug,
      timezone: business.timezone,
      system_currency: business.system_currency ?? 'USD',
    });
  }, [business]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-white/70">
          Control your booking profile, timezone, and system currency from one workspace.
        </p>
      </div>

      <Card className="max-w-2xl space-y-5 p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <p className="text-sm text-white/80">Business name</p>
            <Input
              placeholder="Business name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-white/80">Booking slug</p>
            <Input
              placeholder="your-brand"
              value={form.slug}
              onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-white/80">Timezone</p>
            <Input
              placeholder="Timezone"
              value={form.timezone}
              onChange={(e) => setForm((prev) => ({ ...prev, timezone: e.target.value }))}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <p className="text-sm text-white/80">System currency</p>
            <Select
              value={form.system_currency}
              onValueChange={(value) => setForm((prev) => ({ ...prev, system_currency: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.code} value={option.code}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 text-xs text-white/65">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Prices across dashboard and booking pages use your selected system currency.
          </p>

          <Button onClick={() => mutation.mutate()} disabled={!business || mutation.isPending || !hasChanges}>
            {mutation.isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save changes
          </Button>
        </div>
      </Card>
    </div>
  );
}
