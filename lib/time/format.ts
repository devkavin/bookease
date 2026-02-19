import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

export function formatDate(date: Date) { return format(date, 'PPP'); }
export function formatTime(iso: string, tz: string) { return formatInTimeZone(new Date(iso), tz, 'HH:mm'); }
