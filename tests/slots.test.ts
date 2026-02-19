import { describe, expect, test } from 'vitest';
import { generateSlots } from '@/lib/slots/generateSlots';

const rule = { start_time: '09:00', end_time: '12:00', breaks: [] as { start: string; end: string }[] };

describe('generateSlots', () => {
  test('basic weekday schedule returns slots', () => {
    const slots = generateSlots({ date: '2025-01-06', timezone: 'Asia/Colombo', serviceDurationMinutes: 30, weeklyRule: rule, exception: null, existingBookings: [] });
    expect(slots.length).toBeGreaterThan(0);
  });

  test('breaks removed', () => {
    const slots = generateSlots({ date: '2025-01-06', timezone: 'Asia/Colombo', serviceDurationMinutes: 30, weeklyRule: { ...rule, breaks: [{ start: '10:00', end: '10:30' }] }, exception: null, existingBookings: [] });
    expect(slots.some((s) => s.label === '10:00')).toBe(false);
  });

  test('exception closed => empty', () => {
    const slots = generateSlots({ date: '2025-01-06', timezone: 'Asia/Colombo', serviceDurationMinutes: 30, weeklyRule: rule, exception: { is_closed: true, start_time: null, end_time: null, breaks: [] }, existingBookings: [] });
    expect(slots).toHaveLength(0);
  });

  test('exception custom hours overrides', () => {
    const slots = generateSlots({ date: '2025-01-06', timezone: 'Asia/Colombo', serviceDurationMinutes: 30, weeklyRule: rule, exception: { is_closed: false, start_time: '11:00', end_time: '12:00', breaks: [] }, existingBookings: [] });
    expect(slots[0].label).toBe('11:00');
  });

  test('duration blocking + overlap exclusion with existing booking', () => {
    const slots = generateSlots({ date: '2025-01-06', timezone: 'Asia/Colombo', serviceDurationMinutes: 60, weeklyRule: { start_time: '09:00', end_time: '11:00', breaks: [] }, exception: null, existingBookings: [{ start_at: '2025-01-06T04:30:00.000Z', end_at: '2025-01-06T05:30:00.000Z' }] });
    expect(slots.some((s) => s.label === '10:30')).toBe(false);
    expect(slots.some((s) => s.label === '10:00')).toBe(false);
  });
});
