import { format, parseISO, startOfWeek, endOfWeek, addWeeks, startOfDay, endOfDay } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

export const TIMEZONE = 'America/Los_Angeles';

export function formatInTimezone(date: Date, formatStr: string): string {
  const zonedDate = toZonedTime(date, TIMEZONE);
  return format(zonedDate, formatStr);
}

export function getWeekRange(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 }); // Sunday
  return { start, end };
}

export function getWeekDays(date: Date): Date[] {
  const { start } = getWeekRange(date);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    days.push(day);
  }
  return days;
}

export function formatTime(date: Date): string {
  return formatInTimezone(date, 'h:mm a');
}

export function formatDate(date: Date): string {
  return formatInTimezone(date, 'MMMM d, yyyy');
}

export function formatWeekLabel(date: Date): string {
  return formatInTimezone(date, 'MMM d');
}

export function checkReservationOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && end1 > start2;
}

export function roundToNearestInterval(date: Date, intervalMinutes: number): Date {
  const ms = 1000 * 60 * intervalMinutes;
  return new Date(Math.round(date.getTime() / ms) * ms);
}

export function getTimeSlots(intervalMinutes: number = 15): string[] {
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? 'AM' : 'PM';
      const minuteStr = minute.toString().padStart(2, '0');
      slots.push(`${hour12}:${minuteStr} ${ampm}`);
    }
  }
  return slots;
}

export function parseTimeString(timeStr: string, baseDate: Date): Date {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) throw new Error('Invalid time format');

  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const ampm = match[3].toUpperCase();

  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  const result = new Date(baseDate);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export function getReservationTypeColor(type: string): string {
  const colors: Record<string, string> = {
    STANDARD: '#dbeafe',
    LONG_TERM: '#fef3c7',
    MAINTENANCE: '#fee2e2',
    TRAINING: '#dcfce7',
    CALIBRATION: '#e9d5ff',
    OTHER: '#f3f4f6',
  };
  return colors[type] || colors.OTHER;
}

export function getReservationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    STANDARD: 'Standard',
    LONG_TERM: 'Long-term',
    MAINTENANCE: 'Maintenance',
    TRAINING: 'Training',
    CALIBRATION: 'Calibration',
    OTHER: 'Other',
  };
  return labels[type] || 'Standard';
}
