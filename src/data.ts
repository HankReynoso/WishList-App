import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ensureGuest } from './auth';
import { db } from './firebase';
import { rememberJoined } from './joined';
import type { Guest, Item, ListDoc, WithId } from './types';

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

export const updateItem = (listId: string, itemId: string, name: string, links: string[]) =>
  setDoc(doc(db, 'lists', listId, 'items', itemId), { name, links } satisfies Item);

// The claim doc is left behind on purpose: the owner cannot read or delete
// claims. Guests only render claims for items that exist, so it is inert.
export const deleteItem = (listId: string, itemId: string) => deleteDoc(doc(db, 'lists', listId, 'items', itemId));

export const updateList = (listId: string, title: string, date?: string) =>
  updateDoc(doc(db, 'lists', listId), { title, date: date ?? deleteField() });

const BATCH_LIMIT = 400;

// Items go first, in chunks under the 500-write batch cap. The code and list
// go last in one batch, so a failure midway leaves a list that still exists
// and can be deleted again. Claims and guests are unreachable once the list
// doc is gone and cannot be deleted by the owner.
export async function deleteList(listId: string, code: string) {
  const items = await getDocs(collection(db, 'lists', listId, 'items'));
  for (let i = 0; i < items.docs.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    items.docs.slice(i, i + BATCH_LIMIT).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  const last = writeBatch(db);
  last.delete(doc(db, 'codes', code));
  last.delete(doc(db, 'lists', listId));
  await last.commit();
}

export async function joinList(code: string, name: string): Promise<string> {
  const user = await ensureGuest();
  const found = await getDoc(doc(db, 'codes', code.trim().toUpperCase()));
  if (!found.exists()) throw new Error('No list matches that code.');
  const listId = (found.data() as { listId: string }).listId;
  const guestRef = doc(db, 'lists', listId, 'guests', user.uid);
  const existing = await getDoc(guestRef);
  let guestName = name;
  if (existing.exists()) {
    guestName = (existing.data() as Guest).name;
  } else {
    const batch = writeBatch(db);
    batch.set(guestRef, { name } satisfies Guest);
    batch.update(doc(db, 'lists', listId), { guestCount: increment(1) });
    await batch.commit();
  }
  const list = await getDoc(doc(db, 'lists', listId));
  await rememberJoined({ listId, title: (list.data() as ListDoc).title, name: guestName }).catch(() => {});
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
