'use client';

import { Button } from '@/components/ui/button';

type Slot = { label: string; startISO: string };

export function TimeSlotGrid({
  slots,
  value,
  onSelect,
}: {
  slots: Slot[];
  value?: string;
  onSelect: (s: Slot) => void;
}) {
  if (!slots.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-4 text-sm text-white/70">
        No times available for this day. Try another date.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {slots.map((slot) => (
        <Button
          key={slot.startISO}
          variant={value === slot.startISO ? 'default' : 'outline'}
          className="h-11"
          onClick={() => onSelect(slot)}
        >
          {slot.label}
        </Button>
      ))}
    </div>
  );
}
