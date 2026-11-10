import * as Linking from 'expo-linking';
import { useLocalSearchParams } from 'expo-router';
import { Pressable } from 'react-native';
import { useUser } from '../../src/auth';
import { claimItem, unclaimItem, useCollectionData, useDocData } from '../../src/data';
import { countdown } from '../../src/format';
import type { Claim, Guest, Item, ListDoc } from '../../src/types';
import { Card, Chip, Screen, T } from '../../src/ui';

export default function GuestList() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();
  const { data: list } = useDocData<ListDoc>(`lists/${id}`);
  const { data: me } = useDocData<Guest>(user ? `lists/${id}/guests/${user.uid}` : null);
  const items = useCollectionData<Item>(`lists/${id}/items`).slice().sort((a, b) => a.name.localeCompare(b.name));
  const claims = new Map(useCollectionData<Claim>(`lists/${id}/claims`).map((c) => [c.id, c]));

  if (!list || !user || !me) return null;

  return (
    <Screen>
      <T kind="title">{list.title}</T>
      {list.date ? <T kind="sub">{countdown(list.date)}</T> : null}
      <T kind="sub">Joined as {me.name} · claims are hidden from the owner</T>
      {items.map((i) => {
        const claim = claims.get(i.id);
        return (
          <Card key={i.id}>
            <T kind="name">{i.name}</T>
            {i.links.map((u) => (
              <Pressable key={u} onPress={() => Linking.openURL(u)}>
                <T kind="sub">{u}</T>
              </Pressable>
            ))}
            {!claim ? (
              <Chip label="I'll get this" onPress={() => claimItem(id, i.id, user.uid, me.name).catch(() => {})} />
            ) : claim.guestId === user.uid ? (
              <Chip mine label="Claimed by you · Undo" onPress={() => unclaimItem(id, i.id)} />
            ) : (
              <Chip label={`Claimed by ${claim.guestName}`} />
            )}
          </Card>
        );
      })}
    </Screen>
  );
}
