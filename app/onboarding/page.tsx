'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { businessSchema } from '@/lib/validators/business';
import { createClient } from '@/lib/supabase/browser';
import { CURRENCY_OPTIONS } from '@/lib/currency';
import { GlassCard } from '@/components/app/GlassCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

type FormData = z.infer<typeof businessSchema>;

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function OnboardingPage() {
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: { timezone: 'Asia/Colombo', system_currency: 'USD', name: '', slug: '' }
  });

  const timezone = watch('timezone');
  const currency = watch('system_currency');

  const timezoneOptions = useMemo(() => {
    if (typeof Intl.supportedValuesOf !== 'function') {
      return ['UTC', 'Asia/Colombo', 'America/New_York', 'Europe/London', 'Asia/Singapore'];
    }

    return Intl.supportedValuesOf('timeZone').slice(0, 250);
  }, []);

  const onSubmit = async (values: FormData) => {
    const supabase = createClient();

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error('Session expired. Please sign in again.');
      window.location.href = '/auth/sign-in';
      return;
    }

    const { error: profileError } = await supabase.from('profiles').upsert({ id: user.id });
    if (profileError) {
      toast.error(profileError.message);
      return;
    }

    const { error } = await supabase.from('businesses').insert({ owner_id: user.id, ...values });
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Business setup complete. Redirecting…');
    window.location.href = '/dashboard/overview';
  };

  return (
    <main className="mx-auto grid min-h-screen max-w-xl place-items-center p-4 py-8">
      <GlassCard className="w-full">
        <h1 className="text-2xl">Set up your business</h1>
        <p className="mt-2 text-sm text-white/70">This takes less than a minute. You can change everything later in settings.</p>

        <form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label htmlFor="name">Business name</Label>
            <Input
              id="name"
              placeholder="Acme Studio"
              autoComplete="organization"
              {...register('name')}
              onChange={(event) => {
                const nextName = event.target.value;
                setValue('name', nextName, { shouldValidate: true });

                if (!slugManuallyEdited) {
                  setValue('slug', toSlug(nextName), { shouldValidate: true });
                }
              }}
            />
            {errors.name ? <p className="mt-1 text-xs text-red-300">{errors.name.message}</p> : null}
          </div>

          <div>
            <Label htmlFor="slug">Booking URL slug</Label>
            <Input
              id="slug"
              placeholder="acme-studio"
              {...register('slug')}
              onChange={(event) => {
                setSlugManuallyEdited(true);
                setValue('slug', toSlug(event.target.value), { shouldValidate: true });
              }}
            />
            <p className="mt-1 text-xs text-white/60">Your public booking page: bookease.app/b/{watch('slug') || 'your-slug'}</p>
            {errors.slug ? <p className="mt-1 text-xs text-red-300">{errors.slug.message}</p> : null}
          </div>

          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              list="timezone-options"
              value={timezone}
              onChange={(event) => setValue('timezone', event.target.value, { shouldValidate: true })}
            />
            <datalist id="timezone-options">
              {timezoneOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
            {errors.timezone ? <p className="mt-1 text-xs text-red-300">{errors.timezone.message}</p> : null}
          </div>

          <div>
            <Label>System currency</Label>
            <Select value={currency} onValueChange={(value) => setValue('system_currency', value, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Select system currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((option) => (
                  <SelectItem key={option.code} value={option.code}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.system_currency ? <p className="mt-1 text-xs text-red-300">{errors.system_currency.message}</p> : null}
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving your workspace…' : 'Continue to dashboard'}
          </Button>
        </form>
      </GlassCard>
    </main>
  );
}
