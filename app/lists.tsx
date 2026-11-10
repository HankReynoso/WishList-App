import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { ownerSignOut, useUser } from '../src/auth';
import { createList, useCollectionData } from '../src/data';
import { countdown } from '../src/format';
import type { ListDoc } from '../src/types';
import { Button, Card, DateField, Field, Screen, T } from '../src/ui';

export default function Lists() {
  const { user, ready } = useUser();
  const lists = useCollectionData<ListDoc>(user ? 'lists' : null, user?.uid);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  if (!ready) return null;
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
      {lists.map((l) => (
        <Pressable key={l.id} onPress={() => router.push(`/list/${l.id}`)}>
          <Card>
            <T kind="name">{l.title}</T>
            <T kind="sub">{l.date ? countdown(l.date) : 'No date'}</T>
          </Card>
        </Pressable>
      ))}
      <T kind="name">New list</T>
      <Field placeholder="Title" autoCapitalize="sentences" value={title} onChangeText={setTitle} />
      <DateField value={date} onChange={setDate} />
      {error ? <T kind="sub">{error}</T> : null}
      <Button label="Create list" onPress={add} />
      <Button
        label="Sign out"
        onPress={async () => {
          await ownerSignOut();
          router.replace('/');
        }}
      />
    </Screen>
  );
}
