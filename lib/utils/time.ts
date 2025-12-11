/**
 * Time utility functions
 */

import { formatDistanceToNow } from "date-fns";

/**
 * Converts a date to a human-readable relative time string
 * @param date - The date to convert
 * @returns A string like "2h ago", "3d ago", etc.
 */
export function timeAgo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  const time =   formatDistanceToNow(dateObj, { addSuffix: true })
  return time;
}

/**
 * Formats a date to a full date string
 * @param date - The date to format
 * @returns A formatted date string like "January 1, 2024"
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
