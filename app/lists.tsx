import { Redirect, router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { ownerSignOut, useUser } from '../src/auth';
import { errorMessage } from '../src/errors';
import { createList, useCollectionData } from '../src/data';
import { countdown } from '../src/format';
import { goHome } from '../src/nav';
import { t } from '../src/i18n';
import { ChevronIcon, PersonIcon } from '../src/icons';
import { useTheme } from '../src/theme';
import type { ListDoc } from '../src/types';
import { Button, Card, DateField, Field, Heading, headerSide, IconButton, Loading, Screen, T } from '../src/ui';

export default function Lists() {
  const th = useTheme();
  const { user, ready } = useUser();
  const lists = useCollectionData<ListDoc>(user ? 'lists' : null, user?.uid);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  if (!ready) return <Loading />;
  if (!user || user.isAnonymous) return <Redirect href="/" />;

  const add = async () => {
    if (!title.trim()) return setError(t('giveTitle'));
    try {
      const id = await createList(user.uid, title.trim(), date || undefined);
      setTitle('');
      setDate('');
      setError('');
      router.push(`/list/${id}`);
    } catch (e) {
      setError(errorMessage(e, 'createListFailed'));
    }
  };

  return (
    <Screen>
      <Stack.Screen
        options={headerSide(
          'right',
          <IconButton label={t('settings')} onPress={() => router.push('/settings')}>
            <PersonIcon color={th.primary} />
          </IconButton>,
        )}
      />
      <Heading eyebrow={t('listsEyebrow')} title={t('myLists')} />
      {lists.map((l) => (
        <Pressable key={l.id} onPress={() => router.push(`/list/${l.id}`)} accessibilityRole="button">
          <Card style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 18 }}>
            <View style={{ flex: 1, gap: 3 }}>
              <T kind="name">{l.title}</T>
              <T kind="sub">
                {l.date ? countdown(l.date) : t('noDate')} · {t('guestCount', { count: l.guestCount })}
              </T>
            </View>
            <ChevronIcon color={th.sub} />
          </Card>
        </Pressable>
      ))}
      <Card style={{ marginTop: 8 }}>
        <T kind="name">{t('startList')}</T>
        <Field placeholder={t('listTitlePlaceholder')} autoCapitalize="sentences" value={title} onChangeText={setTitle} />
        <DateField value={date} onChange={setDate} />
        {error ? <T kind="error">{error}</T> : null}
        <Button label={t('createList')} onPress={add} />
      </Card>
      <Button
        variant="quiet"
        label={t('signOut')}
        onPress={async () => {
          await ownerSignOut();
          goHome();
        }}
      />
    </Screen>
  );
}
