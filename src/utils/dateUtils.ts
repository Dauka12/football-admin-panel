/**
 * Formats a date string for display
 * @param dateStr - ISO date string
 * @param format - Optional format type ('datetime' | 'date' | 'time')
 * @returns Formatted date string
 */
export const formatDateTime = (dateStr: string, format: 'datetime' | 'date' | 'time' = 'datetime'): string => {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  
  if (isNaN(date.getTime())) {
    return dateStr; // Return original string if invalid date
  }
  
  const options: Intl.DateTimeFormatOptions = {};
  
  if (format === 'datetime' || format === 'date') {
    options.year = 'numeric';
    options.month = 'short';
    options.day = 'numeric';
  }
  
  if (format === 'datetime' || format === 'time') {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return date.toLocaleString(undefined, options);
};
