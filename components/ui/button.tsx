import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost';
};

export function Button({ className, variant = 'default', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50',
        variant === 'default' && 'bg-sky-500 text-white hover:bg-sky-400',
        variant === 'outline' && 'border border-white/20 bg-white/5 hover:bg-white/10',
        variant === 'ghost' && 'hover:bg-white/10',
        className
      )}
      {...props}
    />
  );
}
