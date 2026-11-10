const pad = (n: number) => String(n).padStart(2, '0');

// Local calendar date, never toISOString, which shifts the day across time zones.
export const toDateString = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromDateString = (s: string) => new Date(`${s}T00:00:00`);

export function countdown(date: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((new Date(`${date}T00:00:00`).getTime() - today.getTime()) / 864e5);
  if (days > 1) return `${days} days to go`;
  if (days === 1) return 'Tomorrow';
  if (days === 0) return 'Today';
  return 'Date has passed';
}

export const normalizeUrl = (raw: string) => (/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);

export const parseLinks = (text: string) =>
  text
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(normalizeUrl);
