'use client';

import { addDays, format, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';

type BookingCalendarProps = {
  value: string;
  onChange: (value: string) => void;
  availableDates: string[];
  closedDates: string[];
  onMonthChange: (monthKey: string) => void;
};

export function BookingCalendar({ value, onChange, availableDates, closedDates, onMonthChange }: BookingCalendarProps) {
  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const maxDate = addDays(minDate, 90);

  return (
    <div className="space-y-3">
      <Calendar
        mode="single"
        selected={parseISO(`${value}T00:00:00`)}
        onSelect={(date) => {
          if (!date) return;
          onChange(format(date, 'yyyy-MM-dd'));
        }}
        onMonthChange={(month) => onMonthChange(format(month, 'yyyy-MM'))}
        disabled={{ before: minDate, after: maxDate }}
        modifiers={{
          available: availableDates.map((day) => parseISO(`${day}T00:00:00`)),
          closed: closedDates.map((day) => parseISO(`${day}T00:00:00`)),
        }}
        modifiersClassNames={{
          available: '[&>button]:border-emerald-400/60 [&>button]:bg-emerald-500/10',
          closed: '[&>button]:border-rose-400/40 [&>button]:bg-rose-500/10',
        }}
      />
      <div className="flex flex-wrap gap-4 text-xs text-white/70">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />Available
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />Closed
        </span>
      </div>
    </div>
  );
}
