'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/app/GlassCard';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  async function onSubmit() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message); else {
      const { data: user } = await supabase.auth.getUser();
      const { data: biz } = await supabase.from('businesses').select('id').eq('owner_id', user.user?.id).maybeSingle();
      window.location.href = biz ? '/dashboard/overview' : '/onboarding';
    }
  }
  return <main className="mx-auto grid min-h-screen max-w-md place-items-center px-4"><GlassCard className="w-full"><h1 className="mb-4 text-2xl">Sign in</h1><Label>Email</Label><Input value={email} onChange={(e)=>setEmail(e.target.value)} /><Label className="mt-3">Password</Label><Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} /><Button className="mt-4 w-full" onClick={onSubmit}>Sign in</Button>{error && <p className="mt-2 text-sm text-red-300">{error}</p>}</GlassCard></main>;
}
