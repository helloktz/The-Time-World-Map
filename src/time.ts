/** The product always uses a fixed UTC+08:00 offset, never the browser's timezone or historical DST. */
export const BEIJING_OFFSET_MS = 8 * 60 * 60 * 1000;
export const DAY_MS = 24 * 60 * 60 * 1000;
export const DAY_END_MS = DAY_MS - 60_000; // Explicit visible endpoint 23:59, as specified.
const pad = (n: number) => String(n).padStart(2, '0');
export function beijingParts(date: Date) {
  if (!Number.isFinite(date.getTime())) throw new RangeError('Invalid date');
  const d = new Date(date.getTime() + BEIJING_OFFSET_MS);
  return { date: `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}`, time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`, year: d.getUTCFullYear(), seconds: pad(d.getUTCSeconds()) };
}
export function parseBeijing(dateString: string, timeString = '00:00'): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString) || !/^\d{2}:\d{2}(?::\d{2})?$/.test(timeString)) throw new RangeError('Invalid date/time format');
  const [y,m,d] = dateString.split('-').map(Number), [h,min,s=0] = timeString.split(':').map(Number);
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || h > 23 || min > 59 || s > 59) throw new RangeError('Date/time outside supported range');
  const utc = Date.UTC(y,m-1,d,h,min,s), check = new Date(utc);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m-1 || check.getUTCDate() !== d) throw new RangeError('Invalid calendar date');
  return new Date(utc - BEIJING_OFFSET_MS);
}
export function formatBeijing(date: Date, includeSeconds = false): string {
  const p = beijingParts(date);
  return `${p.date} ${p.time}${includeSeconds ? ':'+p.seconds : ''}`;
}
export function startOfBeijingDay(date: Date | string): Date {
  return parseBeijing(typeof date === 'string' ? date : beijingParts(date).date);
}
export function dayProgress(date: Date): number { return Math.max(0, Math.min(1, (date.getTime() - startOfBeijingDay(date).getTime()) / DAY_END_MS)); }
export function atDayProgress(day: Date | string, progress: number): Date {
  if (!Number.isFinite(progress)) throw new RangeError('Invalid progress');
  return new Date(startOfBeijingDay(day).getTime() + Math.max(0,Math.min(1,progress))*DAY_END_MS);
}
/** Playback continuously spans 00:00 to 23:59 inclusive; stops rather than rolling into tomorrow. */
export function playbackTime(day: Date | string, elapsedMs: number, durationSeconds: number) {
  if (!Number.isFinite(elapsedMs) || !Number.isFinite(durationSeconds) || durationSeconds <= 0) throw new RangeError('Invalid playback time');
  const progress = Math.max(0,Math.min(1,elapsedMs/(durationSeconds*1000)));
  return { date: atDayProgress(day,progress), progress, finished: progress >= 1 };
}
