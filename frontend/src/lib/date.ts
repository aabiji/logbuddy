export function formatDate(date: Date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formatter = new Intl.DateTimeFormat('en-US', options);
  return formatter.format(date);
}

// Get the unix timestamp of the date normalized to midnight of its day
// Using this to get a numeric representation of a day
export const dayUnixTimestamp = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

