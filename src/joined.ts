import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { ensureGuest } from './auth';
import { db } from './firebase';

export type Joined = { listId: string; title: string; name: string };
// 'unknown' means the check failed (offline), which must not look like a deleted list.
export type JoinedStatus = 'available' | 'unavailable' | 'unknown';

const KEY = 'joined-lists';

export async function loadJoined(): Promise<Joined[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Joined[]) : [];
  } catch {
    return [];
  }
}

export async function rememberJoined(entry: Joined) {
  const rest = (await loadJoined()).filter((j) => j.listId !== entry.listId);
  await AsyncStorage.setItem(KEY, JSON.stringify([entry, ...rest]));
}

export async function forgetJoined(listId: string) {
  const rest = (await loadJoined()).filter((j) => j.listId !== listId);
  await AsyncStorage.setItem(KEY, JSON.stringify(rest));
}

// True when this device's guest session is still a member of the list. The
// anonymous session is replaced if an owner signs in on the device, and the
// old guest doc is then unreachable.
export async function stillJoined(listId: string): Promise<boolean> {
  const user = await ensureGuest();
  return (await getDoc(doc(db, 'lists', listId, 'guests', user.uid))).exists();
}

export function useJoined() {
  const [items, setItems] = useState<Joined[] | null>(null);
  const [status, setStatus] = useState<Record<string, JoinedStatus>>({});

  useEffect(() => {
    let live = true;
    (async () => {
      const stored = await loadJoined();
      if (!live) return;
      setItems(stored);
      if (stored.length === 0) return;
      try {
        await ensureGuest();
      } catch {
        return;
      }
      const checked = await Promise.all(
        stored.map(async (j): Promise<[string, JoinedStatus]> => {
          try {
            return [j.listId, (await getDoc(doc(db, 'lists', j.listId))).exists() ? 'available' : 'unavailable'];
          } catch {
            return [j.listId, 'unknown'];
          }
        }),
      );
      if (live) setStatus(Object.fromEntries(checked));
    })();
    return () => {
      live = false;
    };
  }, []);

  const remove = useCallback(async (listId: string) => {
    await forgetJoined(listId);
    setItems((cur) => cur && cur.filter((j) => j.listId !== listId));
  }, []);

  return { items, status, remove };
}
