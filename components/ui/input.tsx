import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm outline-none ring-sky-400 placeholder:text-white/40 focus:ring-2',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
