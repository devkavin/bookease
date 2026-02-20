'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, CheckCircle2, Circle } from 'lucide-react';

import { GlassCard } from '@/components/app/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/browser';
import { getEmailRedirectUrl } from '@/lib/auth/emailRedirect';
import { toast } from 'sonner';

const signUpSchema = z
  .object({
    email: z.string().email('Use a valid email address').trim(),
    password: z
      .string()
      .min(10, 'Use at least 10 characters')
      .regex(/[A-Z]/, 'Add at least one uppercase letter')
      .regex(/[a-z]/, 'Add at least one lowercase letter')
      .regex(/[0-9]/, 'Add at least one number'),
    confirmPassword: z.string()
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword']
  });

type SignUpData = z.infer<typeof signUpSchema>;

const passwordChecks = [
  { label: '10+ characters', test: (password: string) => password.length >= 10 },
  { label: 'Uppercase letter', test: (password: string) => /[A-Z]/.test(password) },
  { label: 'Lowercase letter', test: (password: string) => /[a-z]/.test(password) },
  { label: 'Number', test: (password: string) => /[0-9]/.test(password) }
];

function getPasswordStrength(password: string) {
  const score = passwordChecks.filter((check) => check.test(password)).length;

  if (score <= 1) return { label: 'Weak', color: 'bg-red-400', width: 'w-1/4' };
  if (score <= 2) return { label: 'Fair', color: 'bg-amber-300', width: 'w-2/4' };
  if (score === 3) return { label: 'Strong', color: 'bg-sky-300', width: 'w-3/4' };

  return { label: 'Excellent', color: 'bg-emerald-300', width: 'w-full' };
}

export default function SignUpPage() {
  const [notice, setNotice] = useState('');
  const [serverError, setServerError] = useState('');
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '', confirmPassword: '' }
  });

  const password = watch('password') ?? '';
  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  useEffect(() => {
    if (!resendCooldown) return;
    const timeout = window.setTimeout(() => setResendCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timeout);
  }, [resendCooldown]);

  async function onSubmit(values: SignUpData) {
    setServerError('');
    setNotice('');

    const supabase = createClient();
    const normalizedEmail = values.email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: values.password,
      options: {
        emailRedirectTo: getEmailRedirectUrl()
      }
    });

    if (error) {
      setServerError(error.message);
      if (normalizedEmail) setPendingConfirmationEmail(normalizedEmail);
      return;
    }

    if (data.user?.id) {
      await supabase.from('profiles').upsert({ id: data.user.id });
    }

    if (data.session) {
      toast.success('Welcome aboard! Redirecting to onboarding…');
      window.location.href = '/onboarding';
      return;
    }

    setPendingConfirmationEmail(normalizedEmail);
    setResendCooldown(30);
    setNotice(`Confirmation email sent to ${normalizedEmail}. Check inbox + spam and click Confirm your mail.`);
  }

  async function onResendConfirmation() {
    if (!pendingConfirmationEmail || resendCooldown > 0) return;

    setServerError('');
    setNotice('');
    setResending(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: pendingConfirmationEmail,
      options: {
        emailRedirectTo: getEmailRedirectUrl()
      }
    });

    setResending(false);

    if (error) {
      setServerError(error.message);
      return;
    }

    setResendCooldown(30);
    setNotice(`Fresh confirmation email sent to ${pendingConfirmationEmail}.`);
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-4 py-8">
      <GlassCard className="w-full">
        <h1 className="text-2xl">Create your account</h1>
        <p className="mb-4 mt-2 text-sm text-white/70">Fast sign-up, secure email verification, and guided onboarding.</p>

        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-red-300">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('password')}
              />
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

            <div className="mt-2">
              <div className="h-1.5 w-full rounded-full bg-white/10">
                <div className={`h-1.5 rounded-full transition-all ${passwordStrength.color} ${passwordStrength.width}`} />
              </div>
              <p className="mt-1 text-xs text-white/70">Password strength: {passwordStrength.label}</p>
            </div>

            <ul className="mt-2 space-y-1 text-xs text-white/70">
              {passwordChecks.map((check) => {
                const passed = check.test(password);
                return (
                  <li key={check.label} className="flex items-center gap-1.5">
                    {passed ? <CheckCircle2 size={14} className="text-emerald-300" /> : <Circle size={14} className="text-white/30" />}
                    <span>{check.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-300">{errors.confirmPassword.message}</p>}
          </div>

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        {pendingConfirmationEmail && (
          <Button
            className="mt-3 w-full"
            type="button"
            variant="outline"
            onClick={onResendConfirmation}
            disabled={resending || resendCooldown > 0}
          >
            {resending
              ? 'Resending…'
              : resendCooldown > 0
                ? `Resend available in ${resendCooldown}s`
                : 'Resend confirmation email'}
          </Button>
        )}

        <p className="mt-3 text-center text-xs text-white/70">
          Already have an account?{' '}
          <Link href="/auth/sign-in" className="text-white underline underline-offset-4">
            Sign in
          </Link>
        </p>

        {notice && <p className="mt-3 text-sm text-emerald-200">{notice}</p>}
        {serverError && <p className="mt-2 text-sm text-red-300">{serverError}</p>}
      </GlassCard>
    </main>
  );
}
