import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { stillJoined, useJoined } from '../src/joined';
import { Card, Chip, Screen, T } from '../src/ui';

export default function JoinedLists() {
  const { items, status, remove } = useJoined();
  const [error, setError] = useState('');

  const open = async (listId: string) => {
    setError('');
    try {
      if (await stillJoined(listId)) router.push(`/guest/${listId}`);
      else setError('This device is no longer signed in as that guest. Join again with the invite code.');
    } catch {
      setError('Could not open the list. Check your connection and try again.');
    }
  };

  if (!items) return null;

  return (
    <Screen>
      {items.length === 0 ? <T kind="sub">Lists you join show up here.</T> : null}
      {error ? <T kind="sub">{error}</T> : null}
      {items.map((j) => {
        const gone = status[j.listId] === 'unavailable';
        return (
          <Pressable key={j.listId} disabled={gone} onPress={() => open(j.listId)}>
            <Card>
              <T kind="name">{j.title}</T>
              <T kind="sub">{gone ? 'This list is no longer available.' : `Joined as ${j.name}`}</T>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Chip danger label={gone ? 'Remove' : 'Leave'} onPress={() => remove(j.listId)} />
              </View>
            </Card>
          </Pressable>
        );
      })}
    </Screen>
  );
}
