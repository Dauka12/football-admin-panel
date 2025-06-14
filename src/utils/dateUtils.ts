/**
 * Formats a date string or timestamp for display
 * @param dateValue - ISO date string, timestamp number, or timestamp string
 * @param format - Optional format type ('datetime' | 'date' | 'time')
 * @returns Formatted date string
 */
export const formatDateTime = (dateValue: string | number, format: 'datetime' | 'date' | 'time' = 'datetime'): string => {
  if (dateValue === undefined || dateValue === null || dateValue === '') return '';
  
  let date: Date;
  
  // Handle different input types (string, number or timestamp string)
  if (typeof dateValue === 'number') {
    // Check if timestamp is in seconds (10 digits) or milliseconds (13 digits)
    if (dateValue.toString().length === 10) {
      // Convert seconds to milliseconds for JavaScript Date
      date = new Date(dateValue * 1000);
    } else {
      // Assume it's already in milliseconds
      date = new Date(dateValue);
    }
  } else {
    // Handle string input
    // First check if it's a pure numeric string (timestamp)
    const maybeTimestamp = parseInt(dateValue, 10);
    if (!isNaN(maybeTimestamp) && dateValue === maybeTimestamp.toString()) {
      // It's a pure numeric string - treat as timestamp
      if (maybeTimestamp.toString().length === 10) {
        // Convert seconds to milliseconds for JavaScript Date
        date = new Date(maybeTimestamp * 1000);
      } else if (maybeTimestamp > 1000000000000) {
        // If number is big enough to be a millisecond timestamp
        date = new Date(maybeTimestamp);
      } else {
        // Small number, treat as ISO string
        date = new Date(dateValue);
      }
    } else {
      // Otherwise treat as ISO string (like "2025-06-08")
      date = new Date(dateValue);
    }
  }
  
  if (isNaN(date.getTime())) {
    console.warn('Invalid date detected:', dateValue);
    // If still invalid, return original value
    return String(dateValue);
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
