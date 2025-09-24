export function formatDate(date: Date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formatter = new Intl.DateTimeFormat('en-US', options);
  return formatter.format(date);
}
