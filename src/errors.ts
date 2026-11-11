import { t, type Key } from './i18n';

// An Error whose message is already written, and localized, for the user.
export class AppError extends Error {}

const BY_CODE: Record<string, Key> = {
  'auth/invalid-credential': 'errInvalidCredential',
  'auth/wrong-password': 'errInvalidCredential',
  'auth/user-not-found': 'errInvalidCredential',
  'auth/invalid-login-credentials': 'errInvalidCredential',
  'auth/email-already-in-use': 'errEmailInUse',
  'auth/weak-password': 'errWeakPassword',
  'auth/invalid-email': 'errInvalidEmail',
  'auth/network-request-failed': 'errNetwork',
  'unavailable': 'errNetwork',
  'auth/too-many-requests': 'errTooManyRequests',
  'auth/requires-recent-login': 'errRequiresRecentLogin',
};

// Raw Firebase messages are English and technical, so only our own errors and
// known codes reach the screen.
export function errorMessage(e: unknown, fallback: Key = 'errGeneric'): string {
  if (e instanceof AppError) return e.message;
  const code = (e as { code?: string } | null)?.code;
  return t((code && BY_CODE[code]) || fallback);
}
