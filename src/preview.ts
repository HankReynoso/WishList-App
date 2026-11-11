const MAX_IMAGE_URL = 2048;
const TIMEOUT_MS = 6000;

const ENTITIES: Record<string, string> = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' };
const decode = (s: string) =>
  s.replace(/&(?:#x([0-9a-f]+)|#(\d+)|(\w+));/gi, (m, hex?: string, dec?: string, name?: string) =>
    hex ? String.fromCodePoint(parseInt(hex, 16)) : dec ? String.fromCodePoint(Number(dec)) : (ENTITIES[name!.toLowerCase()] ?? m),
  );

function attributes(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of tag.matchAll(/([^\s=<>/"']+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) {
    out[m[1].toLowerCase()] = decode((m[2] ?? m[3] ?? m[4]).trim());
  }
  return out;
}

const RANKS: Record<string, number> = {
  'og:image:secure_url': 0,
  'og:image': 0,
  'og:image:url': 0,
  'twitter:image': 1,
  'twitter:image:src': 1,
};

// Candidates are tried best source first (og, then twitter, then image_src)
// and in page order within a source, so a relative or http og:image that
// cannot be used falls through to the next one.
export function extractPreviewImage(html: string, pageUrl: string): string | undefined {
  const found: { rank: number; url: string }[] = [];
  for (const [tag] of html.matchAll(/<(?:meta|link)\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi)) {
    const a = attributes(tag);
    const isLink = /^<link/i.test(tag);
    const rank = isLink
      ? a.rel?.toLowerCase().split(/\s+/).includes('image_src') ? 2 : undefined
      : RANKS[(a.property ?? a.name ?? '').toLowerCase()];
    const url = isLink ? a.href : a.content;
    if (rank !== undefined && url) found.push({ rank, url });
  }
  for (const { url } of found.sort((x, y) => x.rank - y.rank)) {
    const resolved = resolveHttps(url, pageUrl);
    if (resolved) return resolved;
  }
  return undefined;
}

function resolveHttps(raw: string, base: string): string | undefined {
  try {
    const url = new URL(raw, base).href;
    return url.startsWith('https://') && url.length > 'https://'.length && url.length <= MAX_IMAGE_URL ? url : undefined;
  } catch {
    return undefined;
  }
}

// Any failure (offline, timeout, blocked by the store, no tag) yields
// undefined, so a save never waits more than TIMEOUT_MS or fails over a preview.
export async function fetchPreviewImage(pageUrl: string): Promise<string | undefined> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(pageUrl, {
      signal: controller.signal,
      headers: { Accept: 'text/html,application/xhtml+xml' },
    });
    if (!res.ok) return undefined;
    return extractPreviewImage(await res.text(), res.url || pageUrl);
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}
