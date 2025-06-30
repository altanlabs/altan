import { formatDistanceToNow } from 'date-fns';

const areSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const formatDate = (timestamp) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parseTimestamp(timestamp));
};

const formatTime = (timestamp) => {
  return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(
    parseTimestamp(timestamp),
  );
};

const parseTimestamp = (timestamp) => {
  // Updated regex to match "2023-10-18T17:26:07.979079"
  const regex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.\d+$/;
  const parts = timestamp.match(regex);

  if (!parts) {
    return new Date();
  }

  const year = parseInt(parts[1], 10);
  const month = parseInt(parts[2], 10) - 1;
  const day = parseInt(parts[3], 10);
  const hour = parseInt(parts[4], 10);
  const minute = parseInt(parts[5], 10);
  const second = parseInt(parts[6], 10);

  const date = new Date(Date.UTC(year, month, day, hour, minute, second));

  return date;
};

function transformDateTime(input) {
  if (!input) return input;

  // Use a regex to validate the input format
  const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  if (!regex.test(input)) {
    return input;
  }

  // Replace space with 'T' and append '.0Z'
  return input.replace(' ', 'T') + '.0Z';
}

const formatRelativeTime = (timestamp) => {
  const date = parseTimestamp(timestamp);
  return formatDistanceToNow(date, { addSuffix: true });
};

export {
  areSameDay,
  formatDate,
  formatTime,
  parseTimestamp,
  transformDateTime,
  formatRelativeTime,
};
