'use client';

import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';

type Slot = { label: string; startISO: string };

const slotGroups = [
  { key: 'morning', title: 'Morning', startHour: 0, endHour: 12 },
  { key: 'afternoon', title: 'Afternoon', startHour: 12, endHour: 17 },
  { key: 'evening', title: 'Evening', startHour: 17, endHour: 24 },
] as const;

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
    <div className="max-h-[26rem] space-y-3 overflow-y-auto pr-1">
      {slotGroups.map((group) => {
        const sectionSlots = slots.filter((slot) => {
          const hour = parseISO(slot.startISO).getHours();
          return hour >= group.startHour && hour < group.endHour;
        });

        if (!sectionSlots.length) return null;

        return (
          <section key={group.key} className="space-y-2">
            <h3 className="text-xs font-medium uppercase tracking-wide text-white/60">{group.title}</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
              {sectionSlots.map((slot) => (
                <Button
                  key={slot.startISO}
                  variant={value === slot.startISO ? 'default' : 'outline'}
                  className="h-11"
                  onClick={() => onSelect(slot)}
                >
                  {format(parseISO(slot.startISO), 'h:mm a')}
                </Button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
