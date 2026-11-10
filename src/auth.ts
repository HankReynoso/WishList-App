import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
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

export const ownerSignOut = () => signOut(auth);

// An owner session can never act as a guest under the rules, so joining swaps it out.
export async function ensureGuest(): Promise<User> {
  await auth.authStateReady();
  if (auth.currentUser?.isAnonymous) return auth.currentUser;
  if (auth.currentUser) await signOut(auth);
  return (await signInAnonymously(auth)).user;
}
