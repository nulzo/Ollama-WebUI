import { type ClassValue, clsx } from 'clsx';
import dayjs from 'dayjs';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Formats a number with commas for better readability
 * 
 * Example: 1234567 -> 1,234,567
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatDuration(seconds: number): string {
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${Math.round(remainingSeconds)}s`;
}

export function formatCurrency(value: number): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
  });
  return formatter.format(value);
}

export const formatDate = (date: number) => {
  const formattedDate = dayjs(date).format('MMMM D, YYYY h:mm A');
  return formattedDate;
}

/**
 * Get a relative time string from a date string
 */
export function getRelativeTimeString(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  // Time periods in seconds
  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const week = day * 7;
  const month = day * 30;
  const year = day * 365;
  
  if (seconds < minute) {
    return 'just now';
  } else if (seconds < hour) {
    const minutes = Math.floor(seconds / minute);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (seconds < day) {
    const hours = Math.floor(seconds / hour);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (seconds < week) {
    const days = Math.floor(seconds / day);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else if (seconds < month) {
    const weeks = Math.floor(seconds / week);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (seconds < year) {
    const months = Math.floor(seconds / month);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    const years = Math.floor(seconds / year);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
}
