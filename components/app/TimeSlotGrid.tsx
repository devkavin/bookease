'use client';

import { format, parseISO } from 'date-fns';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

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
          <section key={group.key} className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <h3 className="text-xs font-medium uppercase tracking-wide text-white/60">{group.title}</h3>
            <ToggleGroup
              type="single"
              value={value}
              onValueChange={(nextValue) => {
                if (!nextValue) return;
                const slot = sectionSlots.find((item) => item.startISO === nextValue);
                if (slot) onSelect(slot);
              }}
            >
              {sectionSlots.map((slot) => (
                <ToggleGroupItem key={slot.startISO} value={slot.startISO} aria-label={`Choose ${slot.label}`}>
                  {format(parseISO(slot.startISO), 'h:mm a')}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </section>
        );
      })}
    </div>
  );
}
