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

  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
