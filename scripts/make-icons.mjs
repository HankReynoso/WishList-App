// Regenerates every PNG in assets/ from the SVG below. Run: node scripts/make-icons.mjs
import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync, crc32 } from 'node:zlib';

const GREEN = '#24352B';
const SAGE = '#A9C4AE';
const OAT = '#F1F3EC';
const SIZE = 1024;

// Gift box on a 100x100 grid. The ribbon is a gap between solid shapes, so the
// mark is one flat color and also works as a monochrome silhouette.
const mark = (fill) => `
  <g fill="${fill}">
    <rect x="10" y="34" width="33" height="14" rx="3"/>
    <rect x="57" y="34" width="33" height="14" rx="3"/>
    <rect x="16" y="52" width="27" height="36" rx="4"/>
    <rect x="57" y="52" width="27" height="36" rx="4"/>
    <rect x="45" y="30" width="10" height="58" rx="2"/>
    <path d="M50 30 C36 6 12 12 22 26 C27 33 42 31 50 30 Z"/>
    <path d="M50 30 C64 6 88 12 78 26 C73 33 58 31 50 30 Z"/>
  </g>`;

// Mark occupies about 56% of the canvas by default, centered.
const svg = (inner, { scale = 7.2, bg } = {}) => {
  const off = (SIZE - 100 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  ${bg ? `<rect width="${SIZE}" height="${SIZE}" fill="${bg}"/>` : ''}
  <g transform="translate(${off} ${off}) scale(${scale})">${inner}</g>
</svg>`;
};

const render = (s) => new Resvg(s, { fitTo: { mode: 'width', value: SIZE } }).render();

// resvg always emits RGBA. The App Store rejects icons with an alpha channel,
// so write an RGB PNG by hand.
function rgbPng(rgba, w, h) {
  const raw = Buffer.alloc(h * (1 + w * 3));
  for (let y = 0; y < h; y++) {
    const row = y * (1 + w * 3);
    for (let x = 0; x < w; x++) {
      const s = (y * w + x) * 4;
      raw[row + 1 + x * 3] = rgba[s];
      raw[row + 2 + x * 3] = rgba[s + 1];
      raw[row + 3 + x * 3] = rgba[s + 2];
    }
  }
  const chunk = (type, data) => {
    const head = Buffer.alloc(8);
    head.writeUInt32BE(data.length);
    head.write(type, 4, 'latin1');
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])));
    return Buffer.concat([head, data, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync('assets', { recursive: true });
const out = (name, buf) => writeFileSync(`assets/${name}`, buf);

const opaque = render(svg(mark(GREEN), { bg: OAT }));
out('icon.png', rgbPng(opaque.pixels, SIZE, SIZE));
// Android masks the foreground to the inner 66%, so the mark is smaller here.
out('adaptive-foreground.png', render(svg(mark(GREEN), { scale: 5.4 })).asPng());
out('adaptive-monochrome.png', render(svg(mark('#000000'), { scale: 5.4 })).asPng());
const bg = render(svg('', { bg: OAT }));
out('adaptive-background.png', rgbPng(bg.pixels, SIZE, SIZE));
out('splash.png', render(svg(mark(GREEN), { scale: 8 })).asPng());
out('splash-dark.png', render(svg(mark(SAGE), { scale: 8 })).asPng());
console.log('wrote assets/*.png');
