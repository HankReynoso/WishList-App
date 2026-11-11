import { Redirect, router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { ownerSignOut, useUser } from '../src/auth';
import { createList, useCollectionData } from '../src/data';
import { countdown } from '../src/format';
import { ChevronIcon, PersonIcon } from '../src/icons';
import { useTheme } from '../src/theme';
import type { ListDoc } from '../src/types';
import { Button, Card, DateField, Field, Heading, headerSide, IconButton, Loading, Screen, T } from '../src/ui';

export default function Lists() {
  const t = useTheme();
  const { user, ready } = useUser();
  const lists = useCollectionData<ListDoc>(user ? 'lists' : null, user?.uid);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  if (!ready) return <Loading />;
  if (!user || user.isAnonymous) return <Redirect href="/" />;

  const add = async () => {
    if (!title.trim()) return setError('Give the list a title.');
    try {
      const id = await createList(user.uid, title.trim(), date || undefined);
      setTitle('');
      setDate('');
      setError('');
      router.push(`/list/${id}`);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Screen>
      <Stack.Screen
        options={headerSide(
          'right',
          <IconButton label="Settings" onPress={() => router.push('/settings')}>
            <PersonIcon color={t.primary} />
          </IconButton>,
        )}
      />
      <Heading eyebrow="your wishlists" title="My lists" />
      {lists.map((l) => (
        <Pressable key={l.id} onPress={() => router.push(`/list/${l.id}`)} accessibilityRole="button">
          <Card style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 18 }}>
            <View style={{ flex: 1, gap: 3 }}>
              <T kind="name">{l.title}</T>
              <T kind="sub">
                {l.date ? countdown(l.date) : 'No date'} · {l.guestCount} {l.guestCount === 1 ? 'guest' : 'guests'}
              </T>
            </View>
            <ChevronIcon color={t.sub} />
          </Card>
        </Pressable>
      ))}
      <Card style={{ marginTop: 8 }}>
        <T kind="name">Start a new list</T>
        <Field placeholder="Title, like Maya's birthday" autoCapitalize="sentences" value={title} onChangeText={setTitle} />
        <DateField value={date} onChange={setDate} />
        {error ? <T kind="error">{error}</T> : null}
        <Button label="Create list" onPress={add} />
      </Card>
      <Button
        variant="quiet"
        label="Sign out"
        onPress={async () => {
          await ownerSignOut();
          router.replace('/');
        }}
      />
    </Screen>
  );
}
