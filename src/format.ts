const pad = (n: number) => String(n).padStart(2, '0');

// Local calendar date, never toISOString, which shifts the day across time zones.
export const toDateString = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromDateString = (s: string) => new Date(`${s}T00:00:00`);

export function daysUntil(date: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((fromDateString(date).getTime() - today.getTime()) / 864e5);
}

export function countdown(date: string): string {
  const days = daysUntil(date);
  if (days > 1) return `${days} days to go`;
  if (days === 1) return 'Tomorrow';
  if (days === 0) return 'Today';
  return 'Date has passed';
}

export function domain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export const normalizeUrl = (raw: string) => (/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);

export const parseLinks = (text: string) =>
  text
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(normalizeUrl);
