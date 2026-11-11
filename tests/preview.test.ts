import { describe, expect, it } from 'vitest';
import { extractPreviewImage } from '../src/preview';

const page = 'https://shop.example/products/headphones?ref=1';
const html = (head: string) => `<!doctype html><html><head>${head}</head><body><img src="/logo.png"></body></html>`;

describe('extractPreviewImage', () => {
  it('reads og:image with property before content', () => {
    expect(extractPreviewImage(html('<meta property="og:image" content="https://cdn.shop.example/h.jpg">'), page)).toBe(
      'https://cdn.shop.example/h.jpg',
    );
  });

  it('reads og:image with content first, single quotes and a self-closing tag', () => {
    expect(extractPreviewImage(html("<meta content='https://cdn.shop.example/h.jpg' property='og:image' />"), page)).toBe(
      'https://cdn.shop.example/h.jpg',
    );
  });

  it('prefers og:image over twitter:image and image_src regardless of page order', () => {
    const head = [
      '<link rel="image_src" href="https://cdn.shop.example/link.jpg">',
      '<meta name="twitter:image" content="https://cdn.shop.example/tw.jpg">',
      '<META PROPERTY="og:image" CONTENT="https://cdn.shop.example/og.jpg">',
    ].join('\n');
    expect(extractPreviewImage(html(head), page)).toBe('https://cdn.shop.example/og.jpg');
  });

  it('falls back to twitter:image, then link rel=image_src', () => {
    expect(extractPreviewImage(html('<meta name="twitter:image" content="https://cdn.shop.example/tw.jpg">'), page)).toBe(
      'https://cdn.shop.example/tw.jpg',
    );
    expect(extractPreviewImage(html('<link href="https://cdn.shop.example/l.jpg" rel="image_src">'), page)).toBe(
      'https://cdn.shop.example/l.jpg',
    );
  });

  it('resolves relative and protocol-relative URLs against the page', () => {
    expect(extractPreviewImage(html('<meta property="og:image" content="/img/h.jpg">'), page)).toBe('https://shop.example/img/h.jpg');
    expect(extractPreviewImage(html('<meta property="og:image" content="img/h.jpg">'), page)).toBe(
      'https://shop.example/products/img/h.jpg',
    );
    expect(extractPreviewImage(html('<meta property="og:image" content="//cdn.shop.example/h.jpg">'), page)).toBe(
      'https://cdn.shop.example/h.jpg',
    );
  });

  it('decodes HTML entities in the URL', () => {
    expect(
      extractPreviewImage(html('<meta property="og:image" content="https://cdn.shop.example/h.jpg?w=600&amp;h=600&#x26;q=80">'), page),
    ).toBe('https://cdn.shop.example/h.jpg?w=600&h=600&q=80');
  });

  it('skips an http og:image and falls through to an https twitter:image', () => {
    const head =
      '<meta property="og:image" content="http://cdn.shop.example/h.jpg"><meta name="twitter:image" content="https://cdn.shop.example/tw.jpg">';
    expect(extractPreviewImage(html(head), page)).toBe('https://cdn.shop.example/tw.jpg');
  });

  it('keeps only https, so a relative image on an http page is dropped', () => {
    expect(extractPreviewImage(html('<meta property="og:image" content="/h.jpg">'), 'http://shop.example/p')).toBeUndefined();
    expect(extractPreviewImage(html('<meta property="og:image" content="data:image/png;base64,AAAA">'), page)).toBeUndefined();
  });

  it('handles a > inside an attribute value', () => {
    const head = '<meta name="description" content="a > b"><meta property="og:image" content="https://cdn.shop.example/h.jpg">';
    expect(extractPreviewImage(html(head), page)).toBe('https://cdn.shop.example/h.jpg');
  });

  it('returns undefined when there is no preview tag or the URL is oversize', () => {
    expect(extractPreviewImage(html('<title>Headphones</title><meta property="og:title" content="x">'), page)).toBeUndefined();
    expect(
      extractPreviewImage(html(`<meta property="og:image" content="https://cdn.shop.example/${'x'.repeat(2100)}">`), page),
    ).toBeUndefined();
    expect(extractPreviewImage(html('<meta property="og:image" content="">'), page)).toBeUndefined();
  });
});
