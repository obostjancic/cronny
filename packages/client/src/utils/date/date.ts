import {
  differenceInDays,
  differenceInHours,
  differenceInMilliseconds,
  differenceInMinutes,
  differenceInSeconds,
  format,
} from "date-fns";

export function getISODatePart(dateString: string) {
  return new Date(dateString).toISOString().replace(/T.*/, "");
}

function isYesterday(date: Date) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    yesterday.toISOString().replace(/T.*/, "") ===
    date.toISOString().replace(/T.*/, "")
  );
}

function isToday(date: Date) {
  return (
    new Date().toISOString().replace(/T.*/, "") ===
    date.toISOString().replace(/T.*/, "")
  );
}
export function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (isToday(date)) {
    return "Today";
  }

  if (isYesterday(date)) {
    return "Yesterday";
  }

  return format(date, "MMMM d, yyyy");
}

export const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, "HH:mm:ss");
};

export function formatDateTime(dateString: string) {
  return `${formatDate(dateString)} ${formatTime(dateString)}`;
}

function getDuration(startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const days = differenceInDays(end, start);
  const hours = differenceInHours(end, start) % 24;
  const minutes = differenceInMinutes(end, start) % 60;
  const seconds = differenceInSeconds(end, start) % 60;
  const milliseconds = differenceInMilliseconds(end, start) % 1000;

  return { days, hours, minutes, seconds, milliseconds };
}

export function formatDuration(startDate: string, endDate: string | null) {
  if (!endDate) {
    endDate = new Date().toISOString();
  }

  const { days, hours, minutes, seconds, milliseconds } = getDuration(
    startDate,
    endDate
  );

  const parts = [];

  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds) parts.push(`${seconds}s`);
  if (milliseconds) parts.push(`${milliseconds}ms`);

  return parts.join(" ");
}
