import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ensureGuest } from './auth';
import { db } from './firebase';
import type { Guest, Item, WithId } from './types';

// No 0/O/1/I so a code read aloud or typed from a screenshot is hard to get wrong.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode = () =>
  Array.from({ length: 6 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join('');

export async function createList(ownerId: string, title: string, date?: string) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = newCode();
    const ref = doc(collection(db, 'lists'));
    const batch = writeBatch(db);
    batch.set(ref, { title, ...(date ? { date } : {}), ownerId, code, guestCount: 0 });
    batch.set(doc(db, 'codes', code), { listId: ref.id });
    try {
      await batch.commit();
      return ref.id;
    } catch {
      // a code collision fails the batch, so retry with a fresh code
    }
  }
  throw new Error('Could not create the list. Try again.');
}

export const addItem = (listId: string, name: string, links: string[]) =>
  setDoc(doc(collection(db, 'lists', listId, 'items')), { name, links } satisfies Item);

export async function joinList(code: string, name: string): Promise<string> {
  const user = await ensureGuest();
  const found = await getDoc(doc(db, 'codes', code.trim().toUpperCase()));
  if (!found.exists()) throw new Error('No list matches that code.');
  const listId = (found.data() as { listId: string }).listId;
  const guestRef = doc(db, 'lists', listId, 'guests', user.uid);
  if ((await getDoc(guestRef)).exists()) return listId;
  const batch = writeBatch(db);
  batch.set(guestRef, { name } satisfies Guest);
  batch.update(doc(db, 'lists', listId), { guestCount: increment(1) });
  await batch.commit();
  return listId;
}

export const claimItem = (listId: string, itemId: string, guestId: string, guestName: string) =>
  setDoc(doc(db, 'lists', listId, 'claims', itemId), { guestId, guestName });

export const unclaimItem = (listId: string, itemId: string) =>
  deleteDoc(doc(db, 'lists', listId, 'claims', itemId));

export function useDocData<T>(path: string | null) {
  const [state, setState] = useState<{ data: T | null; ready: boolean }>({ data: null, ready: false });
  useEffect(() => {
    if (!path) return setState({ data: null, ready: true });
    return onSnapshot(
      doc(db, path),
      (s) => setState({ data: s.exists() ? (s.data() as T) : null, ready: true }),
      () => setState({ data: null, ready: true }),
    );
  }, [path]);
  return state;
}

export function useCollectionData<T>(path: string | null, ownedBy?: string) {
  const [data, setData] = useState<WithId<T>[]>([]);
  useEffect(() => {
    if (!path) return setData([]);
    const col = collection(db, path);
    const q = ownedBy ? query(col, where('ownerId', '==', ownedBy)) : col;
    return onSnapshot(
      q,
      (s) => setData(s.docs.map((d) => ({ id: d.id, ...(d.data() as T) }))),
      () => setData([]),
    );
  }, [path, ownedBy]);
  return data;
}
