export type ListDoc = {
  title: string;
  date?: string;
  ownerId: string;
  code: string;
  guestCount: number;
};
export type Item = { name: string; links: string[] };
export type Claim = { guestId: string; guestName: string };
export type Guest = { name: string };
export type WithId<T> = T & { id: string };
