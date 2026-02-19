'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type BookingCalendarProps = {
  value: string;
  onChange: (value: string) => void;
};

function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function fromDateKey(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`);
}

export function BookingCalendar({ value, onChange }: BookingCalendarProps) {
  const selectedDate = fromDateKey(value);
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const [visibleMonth, setVisibleMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  const monthMeta = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = firstDay.getDay();

    return { firstDay, daysInMonth, startOffset };
  }, [visibleMonth]);

  const dayCells = useMemo(() => {
    const cells: Array<{ key: string; label: number; disabled: boolean } | null> = [];
    for (let i = 0; i < monthMeta.startOffset; i += 1) cells.push(null);

    for (let day = 1; day <= monthMeta.daysInMonth; day += 1) {
      const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
      const maxDate = new Date(today);
      maxDate.setDate(today.getDate() + 90);
      const disabled = date < today || date > maxDate;
      cells.push({ key: toDateKey(date), label: day, disabled });
    }

    return cells;
  }, [monthMeta.daysInMonth, monthMeta.startOffset, today, visibleMonth]);

  function shiftMonth(diff: number) {
    setVisibleMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + diff, 1)
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => shiftMonth(-1)} className="px-2 py-1">
          ←
        </Button>
        <p className="text-sm font-semibold">
          {visibleMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
        </p>
        <Button variant="ghost" onClick={() => shiftMonth(1)} className="px-2 py-1">
          →
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs text-white/60">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {dayCells.map((cell, idx) => {
          if (!cell) return <div key={`empty-${idx}`} className="h-11" />;
          const isSelected = cell.key === value;
          return (
            <button
              key={cell.key}
              type="button"
              disabled={cell.disabled}
              onClick={() => onChange(cell.key)}
              className={cn(
                'h-11 rounded-xl border text-sm transition',
                isSelected && 'border-sky-400 bg-sky-500/20 text-sky-100',
                !isSelected && !cell.disabled && 'border-white/15 bg-white/5 hover:bg-white/10',
                cell.disabled && 'cursor-not-allowed border-white/5 text-white/30'
              )}
            >
              {cell.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
