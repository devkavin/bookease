import { fromZonedTime, toZonedTime } from 'date-fns-tz';

export function zonedToUtc(dateTimeLocal: string, timezone: string) {
  return fromZonedTime(dateTimeLocal, timezone);
}
export function utcToZoned(date: Date, timezone: string) {
  return toZonedTime(date, timezone);
}
