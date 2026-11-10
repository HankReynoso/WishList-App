import { deleteUser, EmailAuthProvider, reauthenticateWithCredential, type User } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { deleteList } from './data';
import { db } from './firebase';
import type { ListDoc } from './types';

// Messages are written for the user. The order matters: lists go before the
// Auth user because the rules need a signed-in owner to delete them, so a
// failure at the last step leaves an account with no lists, which a retry
// finishes.
export async function deleteAccount(user: User, password: string) {
  try {
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email ?? '', password));
  } catch (e) {
    const code = (e as { code?: string }).code;
    throw new Error(
      code === 'auth/wrong-password' || code === 'auth/invalid-credential'
        ? 'Wrong password. Nothing was deleted.'
        : 'Could not confirm your password. Nothing was deleted.',
    );
  }
  try {
    const owned = await getDocs(query(collection(db, 'lists'), where('ownerId', '==', user.uid)));
    for (const l of owned.docs) await deleteList(l.id, (l.data() as ListDoc).code);
  } catch {
    throw new Error('Some lists could not be deleted. Your account still exists. Try again.');
  }
  try {
    await deleteUser(user);
  } catch {
    throw new Error('Your lists were deleted, but your account could not be removed. Try again to finish.');
  }
}
