import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, increment, setDoc, writeBatch } from 'firebase/firestore';

const L = 'list1';
let env: RulesTestEnvironment;

const owner = () =>
  env.authenticatedContext('owner1', { firebase: { sign_in_provider: 'password' } }).firestore();
const guest = (uid: string) =>
  env.authenticatedContext(uid, { firebase: { sign_in_provider: 'anonymous' } }).firestore();
const stranger = () => guest('newcomer');

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-wishlist',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});

afterAll(() => env.cleanup());

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'lists', L), { title: 'Birthday', ownerId: 'owner1', code: 'ABC234', guestCount: 2 });
    await setDoc(doc(db, 'codes', 'ABC234'), { listId: L });
    await setDoc(doc(db, 'lists', L, 'items', 'i1'), { name: 'Headphones', links: ['https://a.example'] });
    await setDoc(doc(db, 'lists', L, 'items', 'i2'), { name: 'Candle', links: ['https://b.example'] });
    await setDoc(doc(db, 'lists', L, 'guests', 'g1'), { name: 'Sam' });
    await setDoc(doc(db, 'lists', L, 'guests', 'g2'), { name: 'Jo' });
    await setDoc(doc(db, 'lists', L, 'claims', 'i1'), { guestId: 'g1', guestName: 'Sam' });
  });
});

describe('owner is blind to claims and guest names', () => {
  it('cannot read a claim', async () => {
    await assertFails(getDoc(doc(owner(), 'lists', L, 'claims', 'i1')));
  });
  it('cannot read an unclaimed item claim slot either', async () => {
    await assertFails(getDoc(doc(owner(), 'lists', L, 'claims', 'i2')));
  });
  it('cannot write a claim', async () => {
    await assertFails(setDoc(doc(owner(), 'lists', L, 'claims', 'i2'), { guestId: 'owner1', guestName: 'x' }));
    await assertFails(deleteDoc(doc(owner(), 'lists', L, 'claims', 'i1')));
  });
  it('cannot read a guest name', async () => {
    await assertFails(getDoc(doc(owner(), 'lists', L, 'guests', 'g1')));
  });
  it('can read the guest count on the list', async () => {
    await assertSucceeds(getDoc(doc(owner(), 'lists', L)));
  });
});

describe('guest claims', () => {
  it('can claim an unclaimed item and undo it', async () => {
    const db = guest('g2');
    const ref = doc(db, 'lists', L, 'claims', 'i2');
    await assertSucceeds(setDoc(ref, { guestId: 'g2', guestName: 'Jo' }));
    await assertSucceeds(deleteDoc(ref));
  });
  it('can read claims', async () => {
    await assertSucceeds(getDoc(doc(guest('g2'), 'lists', L, 'claims', 'i1')));
  });
  it('cannot overwrite a claim held by another guest', async () => {
    await assertFails(setDoc(doc(guest('g2'), 'lists', L, 'claims', 'i1'), { guestId: 'g2', guestName: 'Jo' }));
  });
  it('cannot delete another guest claim', async () => {
    await assertFails(deleteDoc(doc(guest('g2'), 'lists', L, 'claims', 'i1')));
  });
  it('cannot claim as someone else or under a false name', async () => {
    await assertFails(setDoc(doc(guest('g2'), 'lists', L, 'claims', 'i2'), { guestId: 'g1', guestName: 'Sam' }));
    await assertFails(setDoc(doc(guest('g2'), 'lists', L, 'claims', 'i2'), { guestId: 'g2', guestName: 'Sam' }));
  });
  it('cannot read or claim before joining', async () => {
    await assertFails(getDoc(doc(stranger(), 'lists', L, 'claims', 'i1')));
    await assertFails(setDoc(doc(stranger(), 'lists', L, 'claims', 'i2'), { guestId: 'newcomer', guestName: 'N' }));
  });
  it('cannot read another guest name', async () => {
    await assertFails(getDoc(doc(guest('g2'), 'lists', L, 'guests', 'g1')));
    await assertSucceeds(getDoc(doc(guest('g2'), 'lists', L, 'guests', 'g2')));
  });
});

describe('joining', () => {
  const join = (uid: string, name: string, count: number | ReturnType<typeof increment> = increment(1)) => {
    const db = guest(uid);
    const batch = writeBatch(db);
    batch.set(doc(db, 'lists', L, 'guests', uid), { name });
    batch.update(doc(db, 'lists', L), { guestCount: count });
    return batch.commit();
  };

  it('a guest joins and bumps the count by one', async () => {
    await assertSucceeds(join('newcomer', 'Newt'));
  });
  it('cannot bump the count without creating a guest doc', async () => {
    await assertFails(setDoc(doc(stranger(), 'lists', L), { guestCount: 3 }, { merge: true }));
  });
  it('cannot inflate the count by more than one', async () => {
    await assertFails(join('newcomer', 'Newt', 9));
  });
  it('an existing guest cannot bump the count again', async () => {
    await assertFails(join('g1', 'Sam'));
  });
  it('a guest cannot change list fields other than the count', async () => {
    const db = stranger();
    const batch = writeBatch(db);
    batch.set(doc(db, 'lists', L, 'guests', 'newcomer'), { name: 'N' });
    batch.update(doc(db, 'lists', L), { guestCount: increment(1), title: 'Hacked' });
    await assertFails(batch.commit());
  });
  it('an owner cannot join their own list as a guest', async () => {
    const db = owner();
    await assertFails(setDoc(doc(db, 'lists', L, 'guests', 'owner1'), { name: 'Me' }));
  });
});

describe('lists, items, codes', () => {
  it('guest can get a list and its items but not query lists', async () => {
    await assertSucceeds(getDoc(doc(guest('g1'), 'lists', L)));
    await assertSucceeds(getDoc(doc(guest('g1'), 'lists', L, 'items', 'i1')));
    await assertFails(getDocs(collection(guest('g1'), 'lists')));
  });
  it('guest cannot write items', async () => {
    await assertFails(setDoc(doc(guest('g1'), 'lists', L, 'items', 'i3'), { name: 'x', links: ['https://x.example'] }));
  });
  it('owner writes items', async () => {
    await assertSucceeds(setDoc(doc(owner(), 'lists', L, 'items', 'i3'), { name: 'Scarf', links: ['https://x.example'] }));
  });
  it('another owner cannot write items', async () => {
    const other = env.authenticatedContext('owner2', { firebase: { sign_in_provider: 'password' } }).firestore();
    await assertFails(setDoc(doc(other, 'lists', L, 'items', 'i3'), { name: 'Scarf', links: ['https://x.example'] }));
  });
  it('owner creates a list together with its code', async () => {
    const db = owner();
    const batch = writeBatch(db);
    batch.set(doc(db, 'lists', 'list2'), { title: 'T', ownerId: 'owner1', code: 'ZZZ999', guestCount: 0 });
    batch.set(doc(db, 'codes', 'ZZZ999'), { listId: 'list2' });
    await assertSucceeds(batch.commit());
  });
  it('a code cannot be overwritten or pointed at someone else list', async () => {
    const db = owner();
    await assertFails(setDoc(doc(db, 'codes', 'ABC234'), { listId: L }));
  });
  it('a guest cannot create a list', async () => {
    await assertFails(setDoc(doc(guest('g1'), 'lists', 'x'), { title: 'T', ownerId: 'g1', code: 'QQQ222', guestCount: 0 }));
  });
});
