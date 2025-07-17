import { formatDistanceToNow } from 'date-fns';

const areSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const formatDate = (timestamp) => {
  // Handle undefined, null, empty string cases
  if (!timestamp || timestamp === '') {
    return 'N/A';
  }

  try {
    const date = parseTimestamp(timestamp);
    if (!date || isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'Invalid Date';
  }
};

const formatTime = (timestamp) => {
  // Handle undefined, null, empty string cases
  if (!timestamp || timestamp === '') {
    return 'N/A';
  }

  try {
    const date = parseTimestamp(timestamp);
    if (!date || isNaN(date.getTime())) {
      return 'Invalid Time';
    }
    
    return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(date);
  } catch (error) {
    console.warn('Error formatting time:', error);
    return 'Invalid Time';
  }
};

const parseTimestamp = (timestamp) => {
  // Handle undefined, null, empty string cases
  if (!timestamp || timestamp === '') {
    return new Date(); // Return current date as fallback
  }

  // If it's already a Date object, return it
  if (timestamp instanceof Date) {
    return timestamp;
  }

  // If it's a number (Unix timestamp), convert it
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }

  // Convert to string if it's not already
  const timestampStr = String(timestamp).trim();
  
  if (!timestampStr) {
    return new Date();
  }

  try {
    // Try parsing as ISO string first (most common format)
    if (timestampStr.includes('T') || timestampStr.includes('Z')) {
      const isoDate = new Date(timestampStr);
      if (!isNaN(isoDate.getTime())) {
        return isoDate;
      }
    }

    // Try custom regex for format "2023-10-18T17:26:07.979079"
    const regex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.?\d*$/;
    const parts = timestampStr.match(regex);

    if (parts) {
      const year = parseInt(parts[1], 10);
      const month = parseInt(parts[2], 10) - 1; // Month is 0-indexed
      const day = parseInt(parts[3], 10);
      const hour = parseInt(parts[4], 10);
      const minute = parseInt(parts[5], 10);
      const second = parseInt(parts[6], 10);

      const date = new Date(Date.UTC(year, month, day, hour, minute, second));
      
      // Validate the constructed date
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // Try parsing other common formats
    const commonFormats = [
      // YYYY-MM-DD HH:mm:ss
      /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/,
      // YYYY-MM-DD
      /^(\d{4})-(\d{2})-(\d{2})$/,
      // MM/DD/YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    ];

    for (const format of commonFormats) {
      const match = timestampStr.match(format);
      if (match) {
        let date;
        if (format === commonFormats[0]) { // YYYY-MM-DD HH:mm:ss
          const [, year, month, day, hour, minute, second] = match;
          date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute), parseInt(second)));
        } else if (format === commonFormats[1]) { // YYYY-MM-DD
          const [, year, month, day] = match;
          date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
        } else if (format === commonFormats[2]) { // MM/DD/YYYY
          const [, month, day, year] = match;
          date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
        }
        
        if (date && !isNaN(date.getTime())) {
          return date;
        }
      }
    }

    // Last resort: try native Date parsing
    const fallbackDate = new Date(timestampStr);
    if (!isNaN(fallbackDate.getTime())) {
      return fallbackDate;
    }

    // If all else fails, return current date
    console.warn('Could not parse timestamp:', timestamp);
    return new Date();
    
  } catch (error) {
    console.warn('Error parsing timestamp:', timestamp, error);
    return new Date();
  }
};

function transformDateTime(input) {
  if (!input) return input;

  // Convert to string and trim
  const inputStr = String(input).trim();
  if (!inputStr) return input;

  // Use a regex to validate the input format
  const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  if (!regex.test(inputStr)) {
    return input;
  }

  // Replace space with 'T' and append '.0Z'
  return inputStr.replace(' ', 'T') + '.0Z';
}

const formatRelativeTime = (timestamp) => {
  // Handle undefined, null, empty string cases
  if (!timestamp || timestamp === '') {
    return 'Unknown time';
  }

  try {
    const date = parseTimestamp(timestamp);
    if (!date || isNaN(date.getTime())) {
      return 'Invalid time';
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.warn('Error formatting relative time:', error);
    return 'Invalid time';
  }
};

export {
  areSameDay,
  formatDate,
  formatTime,
  parseTimestamp,
  transformDateTime,
  formatRelativeTime,
};
