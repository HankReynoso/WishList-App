import { describe, expect, it, vi } from 'vitest';

vi.mock('expo-localization', () => ({ getLocales: () => [{ languageTag: 'en-US' }] }));

const { dictionaries, pickLocale, translate } = await import('../src/i18n');
const { errorMessage, AppError } = await import('../src/errors');

describe('dictionaries', () => {
  it('have identical keys', () => {
    expect(Object.keys(dictionaries.es).sort()).toEqual(Object.keys(dictionaries.en).sort());
  });

  it('have the same shape (string or plural pair) for every key', () => {
    for (const [key, value] of Object.entries(dictionaries.en)) {
      const other = (dictionaries.es as Record<string, unknown>)[key];
      expect(typeof other, key).toBe(typeof value);
      if (typeof value === 'object') expect(Object.keys(other as object).sort(), key).toEqual(Object.keys(value).sort());
    }
  });

  it('have no empty values', () => {
    for (const [loc, dict] of Object.entries(dictionaries)) {
      for (const [key, value] of Object.entries(dict)) {
        const parts = typeof value === 'string' ? [value] : Object.values(value);
        for (const p of parts) expect(p.trim(), `${loc}.${key}`).not.toBe('');
      }
    }
  });

  it('use the same {placeholders} in both languages', () => {
    const slots = (v: string | { one: string; other: string }) =>
      [...(typeof v === 'string' ? v : `${v.one} ${v.other}`).matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
    for (const key of Object.keys(dictionaries.en) as (keyof typeof dictionaries.en)[]) {
      const a = new Set(slots(dictionaries.en[key]));
      const b = new Set(slots(dictionaries.es[key]));
      expect([...b].sort(), key).toEqual([...a].sort());
    }
  });
});

describe('translate', () => {
  it('interpolates params', () => {
    expect(translate('en', 'joinedAs', { name: 'Ana' })).toBe('Joined as Ana');
    expect(translate('es', 'gettingOther', { name: 'Ana' })).toBe('Ana lo regala');
  });

  it('leaves an unknown placeholder visible', () => {
    expect(translate('en', 'joinedAs')).toBe('Joined as {name}');
  });

  it('picks the plural form from count', () => {
    expect(translate('en', 'guestCount', { count: 1 })).toBe('1 guest');
    expect(translate('en', 'guestCount', { count: 3 })).toBe('3 guests');
    expect(translate('en', 'guestCount', { count: 0 })).toBe('0 guests');
    expect(translate('es', 'guestCount', { count: 1 })).toBe('1 invitado');
    expect(translate('es', 'guestCount', { count: 3 })).toBe('3 invitados');
    expect(translate('es', 'statDaysToGo', { count: 1 })).toBe('día restante');
    expect(translate('es', 'daysToGo', { count: 12 })).toBe('Faltan 12 días');
  });
});

describe('pickLocale', () => {
  it.each(['es', 'es-MX', 'es-ES', 'es_419', 'ES-ar'])('maps %s to Spanish', (tag) => {
    expect(pickLocale([tag]).locale).toBe('es');
  });

  it.each(['en-US', 'fr-FR', 'de', 'pt-BR'])('maps %s to English', (tag) => {
    expect(pickLocale([tag]).locale).toBe('en');
  });

  it('defaults to English with no device languages', () => {
    expect(pickLocale([]).locale).toBe('en');
  });

  it('uses the first preferred language the app supports', () => {
    expect(pickLocale(['fr-FR', 'es-MX', 'en-US'])).toEqual({ locale: 'es', tag: 'es-MX' });
  });
});

describe('errorMessage', () => {
  it('maps known Firebase codes to friendly copy', () => {
    for (const code of [
      'auth/invalid-credential',
      'auth/email-already-in-use',
      'auth/weak-password',
      'auth/network-request-failed',
      'auth/too-many-requests',
      'auth/requires-recent-login',
    ]) {
      const msg = errorMessage({ code, message: 'Firebase: Error (' + code + ').' });
      expect(msg, code).not.toContain('Firebase');
      expect(msg, code).not.toBe(errorMessage({}));
    }
  });

  it('falls back to the generic message and never leaks e.message', () => {
    expect(errorMessage(new Error('boom'))).toBe(translate('en', 'errGeneric'));
  });

  it('passes through an AppError message', () => {
    expect(errorMessage(new AppError('already localized'))).toBe('already localized');
  });
});
