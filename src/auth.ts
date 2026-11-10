import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from './firebase';

export function useUser() {
  const [state, setState] = useState<{ user: User | null; ready: boolean }>({ user: null, ready: false });
  useEffect(() => onAuthStateChanged(auth, (user) => setState({ user, ready: true })), []);
  return state;
}

export const ownerSignIn = (email: string, password: string, create: boolean) =>
  (create ? createUserWithEmailAndPassword : signInWithEmailAndPassword)(auth, email, password);

// Firebase can answer auth/user-not-found. Swallowing it keeps the caller's
// message identical for known and unknown emails.
export const sendReset = (email: string) =>
  sendPasswordResetEmail(auth, email).catch((e: { code?: string }) => {
    if (e.code !== 'auth/user-not-found') throw e;
  });

export const ownerSignOut = () => signOut(auth);

// An owner session can never act as a guest under the rules, so joining swaps it out.
export async function ensureGuest(): Promise<User> {
  await auth.authStateReady();
  if (auth.currentUser?.isAnonymous) return auth.currentUser;
  if (auth.currentUser) await signOut(auth);
  return (await signInAnonymously(auth)).user;
}
