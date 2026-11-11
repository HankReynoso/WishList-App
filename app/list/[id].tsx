import * as Linking from 'expo-linking';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Share, Text, View } from 'react-native';
import { deleteList, updateList, useCollectionData, useDocData } from '../../src/data';
import { daysUntil, fromDateString } from '../../src/format';
import { PencilIcon } from '../../src/icons';
import { fonts, useTheme } from '../../src/theme';
import type { Item, ListDoc } from '../../src/types';
import { Button, Card, DateField, Field, headerSide, IconButton, ItemImage, LinkDomains, Loading, Screen, T } from '../../src/ui';

function Stat({ value, label }: { value: string; label: string }) {
  const t = useTheme();
  return (
    <View>
      <Text style={{ fontFamily: fonts.display, fontSize: 22, color: t.heroText }}>{value}</Text>
      <Text style={{ fontFamily: fonts.body, fontSize: 13, color: t.heroSub }}>{label}</Text>
    </View>
  );
}

function HeroCard({ list }: { list: ListDoc }) {
  const t = useTheme();
  const days = list.date ? daysUntil(list.date) : null;
  const eyebrow = list.date
    ? `for ${fromDateString(list.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}`
    : 'your wishlist';
  return (
    <View style={{ backgroundColor: t.hero, borderRadius: 24, padding: 20 }}>
      <Text style={{ fontFamily: fonts.italic, fontSize: 15, color: t.heroSub }}>{eyebrow}</Text>
      <Text accessibilityRole="header" style={{ fontFamily: fonts.display, fontSize: 32, lineHeight: 36, color: t.heroText, marginTop: 4 }}>
        {list.title}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 18, rowGap: 10, marginTop: 14 }}>
        {days !== null && days >= 0 ? (
          <Stat value={days === 0 ? 'Today' : String(days)} label={days === 0 ? 'is the day' : days === 1 ? 'day to go' : 'days to go'} />
        ) : null}
        <Stat value={String(list.guestCount)} label={list.guestCount === 1 ? 'guest' : 'guests'} />
        <Stat value={list.code} label="invite code" />
      </View>
    </View>
  );
}

export default function OwnerList() {
  const t = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: list, ready } = useDocData<ListDoc>(`lists/${id}`);
  const items = useCollectionData<Item>(`lists/${id}/items`).slice().sort((a, b) => a.name.localeCompare(b.name));
  const [editingList, setEditingList] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [listError, setListError] = useState('');

  if (!ready) return <Loading />;
  if (!list) return null;

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
    return Share.share({ message: `Join my Gift-Wrapped list "${list.title}". Code: ${list.code}\n${url}` });
  };

  return (
    <Screen footer={<Button label="Add a wish" onPress={() => router.push({ pathname: '/wish', params: { list: id } })} />}>
      <Stack.Screen options={headerSide('right', <Button small label="Invite" onPress={invite} />)} />
      {editingList ? (
        <Card>
          <T kind="name">Edit list</T>
          <Field placeholder="Title" autoCapitalize="sentences" value={title} onChangeText={setTitle} />
          <DateField value={date} onChange={setDate} />
          {listError ? <T kind="error">{listError}</T> : null}
          <Button label="Save list" onPress={saveList} />
          <Button variant="quiet" label="Cancel" onPress={() => setEditingList(false)} />
        </Card>
      ) : (
        <HeroCard list={list} />
      )}
      <View style={{ paddingHorizontal: 4, paddingTop: 2 }}>
        <T kind="sub">Your guests' claims stay wrapped up. No peeking.</T>
      </View>
      {items.length === 0 ? (
        <Card>
          <T kind="name">No wishes yet</T>
          <T kind="sub">Add a name and a link. We'll find a picture from the shop's page.</T>
        </Card>
      ) : null}
      {items.map((i) => (
        <View key={i.id} style={{ flexDirection: 'row', gap: 14, alignItems: 'center', padding: 10, borderRadius: 20, backgroundColor: t.card }}>
          <Pressable onPress={() => Linking.openURL(i.links[0])} accessibilityRole="link" accessibilityLabel={`Open ${i.name}`}>
            <ItemImage id={i.id} uri={i.image} style={{ width: 64, height: 64, borderRadius: 14 }} />
          </Pressable>
          <View style={{ flex: 1, minWidth: 0 }}>
            <T kind="name">{i.name}</T>
            <LinkDomains links={i.links} />
          </View>
          <IconButton label={`Edit ${i.name}`} onPress={() => router.push({ pathname: '/wish', params: { list: id, item: i.id } })}>
            <PencilIcon color={t.primary} />
          </IconButton>
        </View>
      ))}
      {listError && !editingList ? <T kind="error">{listError}</T> : null}
      {editingList ? null : (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 8 }}>
          <Button small variant="quiet" label="Edit list" onPress={startListEdit} />
          <Button small variant="dangerOutline" label="Delete list" onPress={confirmDeleteList} />
        </View>
      )}
    </Screen>
  );
}
