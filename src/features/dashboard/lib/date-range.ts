export type DateRange = { startDate: string; endDate: string };

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function lastNDaysRange(days: number): DateRange {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  return { startDate: toISODate(start), endDate: toISODate(end) };
}

export const TODAY_ISO = toISODate(new Date());
