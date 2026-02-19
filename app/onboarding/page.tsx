'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { businessSchema } from '@/lib/validators/business';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/browser';
import { GlassCard } from '@/components/app/GlassCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type FormData = z.infer<typeof businessSchema>;

export default function OnboardingPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(businessSchema), defaultValues: { timezone: 'Asia/Colombo' } });
  const onSubmit = async (values: FormData) => {
    const supabase = createClient();
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { error } = await supabase.from('businesses').insert({ owner_id: user.user.id, ...values });
    if (error) return alert(error.message);
    window.location.href = '/dashboard/overview';
  };
  return <main className="mx-auto grid min-h-screen max-w-xl place-items-center p-4"><GlassCard className="w-full"><h1 className="text-2xl">Set up your business</h1><form className="mt-4 space-y-3" onSubmit={handleSubmit(onSubmit)}><div><Label>Business name</Label><Input {...register('name')} />{errors.name && <p className="text-xs text-red-300">{errors.name.message}</p>}</div><div><Label>Slug</Label><Input {...register('slug')} />{errors.slug && <p className="text-xs text-red-300">{errors.slug.message}</p>}</div><div><Label>Timezone</Label><Input {...register('timezone')} /></div><Button type="submit">Continue</Button></form></GlassCard></main>;
}
