const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const isDate = (s: string) => DATE.test(s) && !Number.isNaN(Date.parse(s));

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
