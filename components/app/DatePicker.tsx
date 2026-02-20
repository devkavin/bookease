'use client';

import { DatePicker as UIDatePicker } from '@/components/ui/date-picker';

export function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <UIDatePicker value={value} onChange={onChange} />;
}
