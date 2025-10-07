export function formatDate(date: Date, shortened?: boolean) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: "numeric" as const,
    month: shortened ? "short" as const: "long" as const,
    day: "numeric" as const
  });
  return formatter.format(date);
}

// Get the unix timestamp of the date normalized to midnight of its day
// Using this to get a numeric representation of a day
export const dayUnixTimestamp = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export const isSameMonth = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

export const isSameWeek = (a: Date, b: Date): boolean => {
  const startOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
  return startOfWeek(a) === startOfWeek(b);
}

export const elapsedDays = (timestampA: number, timestampB: number) =>
  Math.floor((timestampA - timestampB) / 86400000);