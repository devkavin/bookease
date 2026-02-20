import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost';
};

export function Button({ className, variant = 'default', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold tracking-[0.01em] transition-all duration-200 ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/65 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090512]',
        variant === 'default' &&
          'border border-sky-300/35 bg-gradient-to-r from-sky-500 via-cyan-400 to-violet-500 text-slate-950 shadow-[0_10px_26px_-12px_rgba(56,189,248,0.95)] hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_14px_30px_-14px_rgba(99,102,241,0.95)]',
        variant === 'outline' &&
          'border border-white/20 bg-white/[0.06] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/[0.12]',
        variant === 'ghost' && 'text-white/85 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white',
        className
      )}
      {...props}
    />
  );
}
