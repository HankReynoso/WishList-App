import * as Linking from 'expo-linking';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Share } from 'react-native';
import { addItem, useCollectionData, useDocData } from '../../src/data';
import { countdown, parseLinks } from '../../src/format';
import type { Item, ListDoc } from '../../src/types';
import { Button, Card, Chip, Field, Screen, T } from '../../src/ui';

export default function OwnerList() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: list } = useDocData<ListDoc>(`lists/${id}`);
  const items = useCollectionData<Item>(`lists/${id}/items`).slice().sort((a, b) => a.name.localeCompare(b.name));
  const [name, setName] = useState('');
  const [links, setLinks] = useState('');
  const [error, setError] = useState('');

  if (!list) return null;

  const add = async () => {
    const parsed = parseLinks(links);
    if (!name.trim() || parsed.length === 0) return setError('Add a name and at least one link.');
    try {
      await addItem(id, name.trim(), parsed);
      setName('');
      setLinks('');
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const invite = () => {
    const url = Linking.createURL('join', { queryParams: { code: list.code } });
    return Share.share({ message: `Join my wishlist "${list.title}". Code: ${list.code}\n${url}` });
  };

  return (
    <Screen>
      <T kind="title">{list.title}</T>
      {list.date ? <T kind="sub">{countdown(list.date)}</T> : null}
      <Chip label={`${list.guestCount} ${list.guestCount === 1 ? 'guest' : 'guests'} joined · code ${list.code}`} />
      {items.map((i) => (
        <Card key={i.id}>
          <T kind="name">{i.name}</T>
          {i.links.map((u) => (
            <Pressable key={u} onPress={() => Linking.openURL(u)}>
              <T kind="sub">{u}</T>
            </Pressable>
          ))}
        </Card>
      ))}
      <T kind="name">Add item</T>
      <Field placeholder="Name" autoCapitalize="sentences" value={name} onChangeText={setName} />
      <Field placeholder="Links, one per line" multiline value={links} onChangeText={setLinks} />
      {error ? <T kind="sub">{error}</T> : null}
      <Button label="Add item" onPress={add} />
      <Button label="Share invite" onPress={invite} />
    </Screen>
  );
}
