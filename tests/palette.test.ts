import { describe, expect, it } from 'vitest';
import { palettes, tintFor, type Palette } from '../src/palette';

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

const textPairs: [keyof Palette, keyof Palette][] = [
  ['text', 'bg'],
  ['text', 'card'],
  ['sub', 'bg'],
  ['sub', 'card'],
  ['primary', 'bg'],
  ['primary', 'card'],
  ['primary', 'soft'],
  ['onPrimary', 'primary'],
  ['heroText', 'hero'],
  ['heroSub', 'hero'],
  ['tagText', 'tagBg'],
  ['danger', 'bg'],
  ['danger', 'card'],
  ['danger', 'dangerBg'],
  ['onDanger', 'danger'],
];

describe.each(Object.entries(palettes))('%s palette', (_, p) => {
  it.each(textPairs)('%s on %s reaches 4.5:1', (fg, bg) => {
    expect(contrast(p[fg] as string, p[bg] as string)).toBeGreaterThanOrEqual(4.5);
  });
  it('the gift icon on each tint reaches 3:1', () => {
    for (const t of p.tints) expect(contrast(p.sub, t)).toBeGreaterThanOrEqual(3);
  });
});

it('tintFor is stable and spreads ids across tints', () => {
  const tints = palettes.light.tints;
  expect(tintFor('abc', tints)).toBe(tintFor('abc', tints));
  const used = new Set(Array.from({ length: 40 }, (_, i) => tintFor(`item${i}`, tints)));
  expect(used.size).toBe(tints.length);
});
