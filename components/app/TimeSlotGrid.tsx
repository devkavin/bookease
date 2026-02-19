'use client';
import { Button } from '@/components/ui/button';

export function TimeSlotGrid({ slots, value, onSelect }: { slots: { label: string; startISO: string }[]; value?: string; onSelect: (s: { label: string; startISO: string }) => void }) {
  return <div className="grid grid-cols-3 gap-2">{slots.map((slot) => <Button key={slot.startISO} variant={value === slot.startISO ? 'default' : 'outline'} onClick={() => onSelect(slot)}>{slot.label}</Button>)}</div>;
}
