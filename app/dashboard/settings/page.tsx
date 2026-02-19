'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/browser';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  const supabase = createClient();
  const qc = useQueryClient();

  const { data: business } = useQuery({
    queryKey: ['business'],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', auth.user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({ name: '', slug: '', timezone: 'Asia/Colombo' });

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
    if (business) {
      setForm({
        name: business.name,
        slug: business.slug,
        timezone: business.timezone,
      });
    }
  }, [business]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-white/70">Keep your public profile and booking URL in sync.</p>
      </div>

      <Card className="max-w-2xl space-y-4 p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
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
        </div>

        <Button onClick={() => mutation.mutate()} disabled={!business || mutation.isPending}>
          {mutation.isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save changes
        </Button>
      </Card>
    </div>
  );
}
