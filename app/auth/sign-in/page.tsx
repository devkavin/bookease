'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';

import { createClient } from '@/lib/supabase/browser';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/app/GlassCard';
import { getEmailRedirectUrl } from '@/lib/auth/emailRedirect';

const signInSchema = z.object({
  email: z.string().trim().email('Use a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberEmail: z.boolean()
});

type SignInData = z.infer<typeof signInSchema>;

const rememberedEmailStorageKey = 'bookease.rememberedEmail';

export default function SignInPage() {
  const [serverError, setServerError] = useState('');
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '', rememberEmail: true }
  });

  useEffect(() => {
    const remembered = window.localStorage.getItem(rememberedEmailStorageKey);
    if (remembered) setValue('email', remembered);
  }, [setValue]);

  async function onSubmit(values: SignInData) {
    setServerError('');
    setResendMessage('');
    setPendingConfirmationEmail('');

    const supabase = createClient();
    const normalizedEmail = values.email.trim().toLowerCase();

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: values.password
    });

    if (error) {
      setServerError(error.message);
      if (/email not confirmed/i.test(error.message)) {
        setPendingConfirmationEmail(normalizedEmail);
      }
      return;
    }

    if (values.rememberEmail) {
      window.localStorage.setItem(rememberedEmailStorageKey, normalizedEmail);
    } else {
      window.localStorage.removeItem(rememberedEmailStorageKey);
    }

    const { data: user } = await supabase.auth.getUser();
    const { data: business } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', user.user?.id)
      .maybeSingle();

    window.location.href = business ? '/dashboard/overview' : '/onboarding';
  }

  async function resendConfirmation() {
    if (!pendingConfirmationEmail) return;

    setResending(true);
    setServerError('');
    setResendMessage('');

    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: pendingConfirmationEmail,
      options: { emailRedirectTo: getEmailRedirectUrl() }
    });

    setResending(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    setResendMessage(`Confirmation email sent to ${pendingConfirmationEmail}.`);
  }

  const rememberEmail = watch('rememberEmail');

  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-4 py-8">
      <GlassCard className="w-full">
        <h1 className="text-2xl">Welcome back</h1>
        <p className="mb-4 mt-2 text-sm text-white/70">Sign in to manage bookings, services, and availability.</p>

        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" autoComplete="email" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-red-300">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" {...register('password')} />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-300">{errors.password.message}</p>}
          </div>

          <label className="flex items-center gap-2 text-xs text-white/70">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-white/30 bg-transparent"
              checked={rememberEmail}
              onChange={(event) => setValue('rememberEmail', event.target.checked)}
            />
            Remember this email on this device
          </label>

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        {pendingConfirmationEmail && (
          <Button className="mt-3 w-full" variant="outline" onClick={resendConfirmation} disabled={resending}>
            {resending ? 'Resending…' : 'Resend confirmation email'}
          </Button>
        )}

        <p className="mt-3 text-center text-xs text-white/70">
          New to BookEase?{' '}
          <Link href="/auth/sign-up" className="text-white underline underline-offset-4">
            Create an account
          </Link>
        </p>

        {resendMessage && <p className="mt-3 text-sm text-emerald-200">{resendMessage}</p>}
        {serverError && <p className="mt-2 text-sm text-red-300">{serverError}</p>}
      </GlassCard>
    </main>
  );
}
