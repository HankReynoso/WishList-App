import { router } from 'expo-router';

// replace('/') pushes a second index on top of the existing stack, so the home
// screen showed a back button to the screen the user just left. Dropping the
// stack to its root first leaves exactly one entry.
export function goHome() {
  if (router.canDismiss()) router.dismissAll();
  router.replace('/');
}

// Same stale-stack problem when returning to the lists screen after deleting a
// list: pop back to the existing entry instead of stacking a copy.
export const goLists = () => router.dismissTo('/lists');
