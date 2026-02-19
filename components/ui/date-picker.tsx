'use client';

import { CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function DatePicker({ value, onChange, placeholder = 'Pick a date' }: DatePickerProps) {
  const selected = value ? parseISO(`${value}T00:00:00`) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between">
          <span>{selected ? format(selected, 'PPP') : placeholder}</span>
          <CalendarIcon className="ml-2 h-4 w-4 text-white/60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (!date) return;
            onChange(format(date, 'yyyy-MM-dd'));
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
