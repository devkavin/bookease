'use client';

import { addDays, format, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';

type BookingCalendarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function BookingCalendar({ value, onChange }: BookingCalendarProps) {
  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const maxDate = addDays(minDate, 90);

  return (
    <Calendar
      mode="single"
      selected={parseISO(`${value}T00:00:00`)}
      onSelect={(date) => {
        if (!date) return;
        onChange(format(date, 'yyyy-MM-dd'));
      }}
      disabled={{ before: minDate, after: maxDate }}
    />
  );
}
