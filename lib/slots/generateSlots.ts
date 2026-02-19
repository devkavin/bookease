import { addMinutes } from 'date-fns';
import { fromZonedTime, formatInTimeZone } from 'date-fns-tz';
import { overlaps } from './overlap';
import type { ExceptionRule, Rule } from './types';

function parseLocal(date: string, time: string) { return `${date}T${time}:00`; }

export function generateSlots({ date, timezone, serviceDurationMinutes, weeklyRule, exception, existingBookings }: {
  date: string; timezone: string; serviceDurationMinutes: number; weeklyRule: Rule | null; exception: ExceptionRule; existingBookings: { start_at: string; end_at: string }[];
}) {
  if (!weeklyRule) return [];
  if (exception?.is_closed) return [];
  const rule = exception?.start_time && exception?.end_time ? { start_time: exception.start_time, end_time: exception.end_time, breaks: exception.breaks } : weeklyRule;
  const start = fromZonedTime(parseLocal(date, rule.start_time), timezone);
  const end = fromZonedTime(parseLocal(date, rule.end_time), timezone);
  const slots: { startISO: string; endISO: string; label: string }[] = [];
  for (let cursor = start; cursor < end; cursor = addMinutes(cursor, 15)) {
    const slotEnd = addMinutes(cursor, serviceDurationMinutes);
    if (slotEnd > end) continue;
    const inBreak = rule.breaks.some((b) => {
      const bStart = fromZonedTime(parseLocal(date, b.start), timezone);
      const bEnd = fromZonedTime(parseLocal(date, b.end), timezone);
      return overlaps(cursor, slotEnd, bStart, bEnd);
    });
    if (inBreak) continue;
    const hasBooking = existingBookings.some((b) => overlaps(cursor, slotEnd, new Date(b.start_at), new Date(b.end_at)));
    if (hasBooking) continue;
    slots.push({ startISO: cursor.toISOString(), endISO: slotEnd.toISOString(), label: formatInTimeZone(cursor, timezone, 'HH:mm') });
  }
  return slots;
}
