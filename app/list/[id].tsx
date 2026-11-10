import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Share, View } from 'react-native';
import { addItem, deleteItem, deleteList, updateItem, updateList, useCollectionData, useDocData } from '../../src/data';
import { countdown, parseLinks } from '../../src/format';
import type { Item, ListDoc, WithId } from '../../src/types';
import { Button, Card, Chip, DateField, Field, Screen, T } from '../../src/ui';

export default function OwnerList() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: list } = useDocData<ListDoc>(`lists/${id}`);
  const items = useCollectionData<Item>(`lists/${id}/items`).slice().sort((a, b) => a.name.localeCompare(b.name));
  const [name, setName] = useState('');
  const [links, setLinks] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [editingList, setEditingList] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [listError, setListError] = useState('');

  if (!list) return null;

  const resetItemForm = () => {
    setEditingId(null);
    setName('');
    setLinks('');
    setError('');
  };

  const save = async () => {
    const parsed = parseLinks(links);
    if (!name.trim() || parsed.length === 0) return setError('Add a name and at least one link.');
    try {
      if (editingId) await updateItem(id, editingId, name.trim(), parsed);
      else await addItem(id, name.trim(), parsed);
      resetItemForm();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const startEdit = (i: WithId<Item>) => {
    setEditingId(i.id);
    setName(i.name);
    setLinks(i.links.join('\n'));
    setError('');
  };

  const confirmDeleteItem = (i: WithId<Item>) =>
    Alert.alert('Delete item?', `"${i.name}" will be removed for you and your guests.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (editingId === i.id) resetItemForm();
          deleteItem(id, i.id).catch((e: Error) => setError(e.message));
        },
      },
    ]);

  const startListEdit = () => {
    setTitle(list.title);
    setDate(list.date ?? '');
    setListError('');
    setEditingList(true);
  };

  const saveList = async () => {
    if (!title.trim()) return setListError('Give the list a title.');
    try {
      await updateList(id, title.trim(), date || undefined);
      setEditingList(false);
    } catch (e) {
      setListError((e as Error).message);
    }
  };

  const confirmDeleteList = () =>
    Alert.alert('Delete list?', `"${list.title}" and all its items will be deleted. Guests lose access. This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete list',
        style: 'destructive',
        onPress: () =>
          deleteList(id, list.code)
            .then(() => router.replace('/lists'))
            .catch((e: Error) => setListError(e.message)),
      },
    ]);

  const invite = () => {
    const url = Linking.createURL('join', { queryParams: { code: list.code } });
    return Share.share({ message: `Join my wishlist "${list.title}". Code: ${list.code}\n${url}` });
  };

  return (
    <Screen>
      {editingList ? (
        <Card>
          <Field placeholder="Title" autoCapitalize="sentences" value={title} onChangeText={setTitle} />
          <DateField value={date} onChange={setDate} />
          {listError ? <T kind="sub">{listError}</T> : null}
          <Button label="Save list" onPress={saveList} />
          <Button label="Cancel" onPress={() => setEditingList(false)} />
        </Card>
      ) : (
        <>
          <T kind="title">{list.title}</T>
          {list.date ? <T kind="sub">{countdown(list.date)}</T> : null}
          {listError ? <T kind="sub">{listError}</T> : null}
        </>
      )}
      <Chip label={`${list.guestCount} ${list.guestCount === 1 ? 'guest' : 'guests'} joined · code ${list.code}`} />
      {items.map((i) => (
        <Card key={i.id}>
          <T kind="name">{i.name}</T>
          {i.links.map((u) => (
            <Pressable key={u} onPress={() => Linking.openURL(u)}>
              <T kind="sub">{u}</T>
            </Pressable>
          ))}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Chip label="Edit" onPress={() => startEdit(i)} />
            <Chip label="Delete" onPress={() => confirmDeleteItem(i)} />
          </View>
        </Card>
      ))}
      <T kind="name">{editingId ? 'Edit item' : 'Add item'}</T>
      <Field placeholder="Name" autoCapitalize="sentences" value={name} onChangeText={setName} />
      <Field placeholder="Links, one per line" multiline value={links} onChangeText={setLinks} />
      {error ? <T kind="sub">{error}</T> : null}
      <Button label={editingId ? 'Save item' : 'Add item'} onPress={save} />
      {editingId ? <Button label="Cancel" onPress={resetItemForm} /> : null}
      <Button label="Share invite" onPress={invite} />
      <Button label="Edit list" onPress={startListEdit} />
      <Button label="Delete list" onPress={confirmDeleteList} />
    </Screen>
  );
}
