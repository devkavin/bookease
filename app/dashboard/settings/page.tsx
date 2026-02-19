'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/browser';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const supabase = createClient();
  const qc = useQueryClient();
  const { data: business } = useQuery({
    queryKey: ['business'],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      return (await supabase.from('businesses').select('*').eq('owner_id', auth.user.id).single()).data;
    }
  });
  const [form, setForm] = useState({ name: '', slug: '', timezone: 'Asia/Colombo' });
  const mutation = useMutation({
    mutationFn: async () => {
      if (!business) return;
      const { error } = await supabase.from('businesses').update(form).eq('id', business.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['business'] }); toast.success('Settings updated'); },
    onError: (e: Error) => toast.error(e.message)
  });

  useEffect(() => {
    if (business) setForm({ name: business.name, slug: business.slug, timezone: business.timezone });
  }, [business]);

  return <div><h1 className="mb-4 text-2xl">Settings</h1><div className="grid max-w-xl gap-3"><Input placeholder="Business name" value={form.name} onChange={(e)=>setForm((f)=>({ ...f, name: e.target.value }))} /><Input placeholder="Slug" value={form.slug} onChange={(e)=>setForm((f)=>({ ...f, slug: e.target.value }))} /><Input placeholder="Timezone" value={form.timezone} onChange={(e)=>setForm((f)=>({ ...f, timezone: e.target.value }))} /><Button onClick={()=>mutation.mutate()} disabled={!business}>Save changes</Button></div></div>;
}
