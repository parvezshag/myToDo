import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
  isFuture,
  differenceInDays,
  parseISO,
  startOfDay,
} from 'date-fns';

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d, yyyy');
}

export function formatTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = parseISO(dateStr);
  return format(date, 'h:mm a');
}

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = parseISO(dateStr);
  return format(date, 'MMM d, yyyy h:mm a');
}

export function formatRelative(dateStr: string): string {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
}

export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const date = startOfDay(parseISO(dateStr));
  const now = startOfDay(new Date());
  return date < now;
}

export function isDueToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return isToday(parseISO(dateStr));
}

export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return differenceInDays(parseISO(dateStr), startOfDay(new Date()));
}

export function timeRemaining(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const target = parseISO(dateStr).getTime();
  const diff = target - Date.now();
  if (diff <= 0) return null;
  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

export function toISOString(date: Date): string {
  return date.toISOString();
}

export function nowISO(): string {
  return new Date().toISOString();
}
