import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { stillJoined, useJoined } from '../src/joined';
import { t } from '../src/i18n';
import { ChevronIcon } from '../src/icons';
import { useTheme } from '../src/theme';
import { Button, Card, Heading, Loading, Screen, T } from '../src/ui';

export default function JoinedLists() {
  const th = useTheme();
  const { items, status, remove } = useJoined();
  const [error, setError] = useState('');

  const open = async (listId: string) => {
    setError('');
    try {
      if (await stillJoined(listId)) router.push(`/guest/${listId}`);
      else setError(t('signedOutGuest'));
    } catch {
      setError(t('openListFailed'));
    }
  };

  if (!items) return <Loading />;

  return (
    <Screen>
      <Heading eyebrow={t('joinedEyebrow')} title={t('joinedTitle')} />
      {items.length === 0 ? (
        <Card>
          <T kind="sub">{t('joinedEmpty')}</T>
          <Button label={t('joinWithCode')} onPress={() => router.push('/join')} />
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
                <T kind="sub">{gone ? t('listGone') : t('joinedAs', { name: j.name })}</T>
              </View>
              {gone ? null : <ChevronIcon color={th.sub} />}
            </Pressable>
            <Button small variant="dangerOutline" label={gone ? t('remove') : t('leave')} onPress={() => remove(j.listId)} />
          </Card>
        );
      })}
    </Screen>
  );
}
