export type ListDoc = {
  title: string;
  date?: string;
  ownerId: string;
  code: string;
  guestCount: number;
};
// image is an https URL read from the first link's page when the item was saved.
export type Item = { name: string; links: string[]; image?: string };
export type Claim = { guestId: string; guestName: string };
export type Guest = { name: string };
export type WithId<T> = T & { id: string };
