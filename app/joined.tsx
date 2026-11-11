import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { stillJoined, useJoined } from '../src/joined';
import { ChevronIcon } from '../src/icons';
import { useTheme } from '../src/theme';
import { Button, Card, Heading, Loading, Screen, T } from '../src/ui';

export default function JoinedLists() {
  const t = useTheme();
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

  if (!items) return <Loading />;

  return (
    <Screen>
      <Heading eyebrow="lists you've joined" title="Joined lists" />
      {items.length === 0 ? (
        <Card>
          <T kind="sub">Lists you join show up here.</T>
          <Button label="Join with a code" onPress={() => router.push('/join')} />
        </Card>
      ) : null}
      {error ? <T kind="error">{error}</T> : null}
      {items.map((j) => {
        const gone = status[j.listId] === 'unavailable';
        return (
          <Card key={j.listId} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Pressable
              disabled={gone}
              onPress={() => open(j.listId)}
              accessibilityRole="button"
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <View style={{ flex: 1, gap: 3 }}>
                <T kind="name">{j.title}</T>
                <T kind="sub">{gone ? 'This list is no longer available.' : `Joined as ${j.name}`}</T>
              </View>
              {gone ? null : <ChevronIcon color={t.sub} />}
            </Pressable>
            <Button small variant="dangerOutline" label={gone ? 'Remove' : 'Leave'} onPress={() => remove(j.listId)} />
          </Card>
        );
      })}
    </Screen>
  );
}
