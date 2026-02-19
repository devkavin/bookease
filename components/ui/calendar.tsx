'use client';

import type * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ className, classNames, showOutsideDays = false, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('rounded-2xl border border-white/10 bg-white/5 p-3', className)}
      classNames={{
        months: 'flex flex-col gap-3',
        month: 'space-y-3',
        caption: 'relative flex items-center justify-center pt-1',
        caption_label: 'text-sm font-semibold text-white',
        nav: 'flex items-center gap-1',
        button_previous:
          'absolute left-1 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white hover:bg-white/10',
        button_next:
          'absolute right-1 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white hover:bg-white/10',
        month_grid: 'w-full border-collapse',
        weekdays: 'grid grid-cols-7 gap-1',
        weekday: 'h-9 w-9 text-center text-xs font-medium leading-9 text-white/60',
        week: 'mt-1 grid grid-cols-7 gap-1',
        day: 'h-9 w-9 p-0 text-sm',
        day_button:
          'h-9 w-9 rounded-lg border border-transparent text-white transition hover:border-white/15 hover:bg-white/10 disabled:cursor-not-allowed disabled:text-white/30',
        selected: '[&>button]:border-sky-400 [&>button]:bg-sky-500/20 [&>button]:text-sky-100',
        today: '[&>button]:border-white/30',
        outside: '[&>button]:text-white/30',
        disabled: '[&>button]:opacity-40',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...iconProps }) =>
          orientation === 'left' ? <ChevronLeft className="h-4 w-4" {...iconProps} /> : <ChevronRight className="h-4 w-4" {...iconProps} />,
      }}
      {...props}
    />
  );
}
