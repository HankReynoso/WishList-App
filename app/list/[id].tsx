import * as Linking from 'expo-linking';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Share, Text, View } from 'react-native';
import { deleteList, updateList, useCollectionData, useDocData } from '../../src/data';
import { daysUntil, formatDate } from '../../src/format';
import { errorMessage } from '../../src/errors';
import { t } from '../../src/i18n';
import { goLists } from '../../src/nav';
import { PencilIcon } from '../../src/icons';
import { fonts, useTheme } from '../../src/theme';
import type { Item, ListDoc } from '../../src/types';
import { Button, Card, DateField, Field, headerSide, IconButton, ItemImage, LinkDomains, Loading, Screen, T } from '../../src/ui';

function Stat({ value, label }: { value: string; label: string }) {
  const th = useTheme();
  return (
    <View>
      <Text style={{ fontFamily: fonts.display, fontSize: 22, color: th.heroText }}>{value}</Text>
      <Text style={{ fontFamily: fonts.body, fontSize: 13, color: th.heroSub }}>{label}</Text>
    </View>
  );
}

function HeroCard({ list }: { list: ListDoc }) {
  const th = useTheme();
  const days = list.date ? daysUntil(list.date) : null;
  const eyebrow = list.date ? t('forDate', { date: formatDate(list.date, { month: 'long', day: 'numeric' }) }) : t('yourWishlist');
  return (
    <View style={{ backgroundColor: th.hero, borderRadius: 24, padding: 20 }}>
      <Text style={{ fontFamily: fonts.italic, fontSize: 15, color: th.heroSub }}>{eyebrow}</Text>
      <Text accessibilityRole="header" style={{ fontFamily: fonts.display, fontSize: 32, lineHeight: 36, color: th.heroText, marginTop: 4 }}>
        {list.title}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 18, rowGap: 10, marginTop: 14 }}>
        {days !== null && days >= 0 ? (
          <Stat
            value={days === 0 ? t('statToday') : String(days)}
            label={days === 0 ? t('statIsTheDay') : t('statDaysToGo', { count: days })}
          />
        ) : null}
        <Stat value={String(list.guestCount)} label={t('statGuests', { count: list.guestCount })} />
        <Stat value={list.code} label={t('statCode')} />
      </View>
    </View>
  );
}

export default function OwnerList() {
  const th = useTheme();
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
    if (!title.trim()) return setListError(t('giveTitle'));
    try {
      await updateList(id, title.trim(), date || undefined);
      setEditingList(false);
    } catch (e) {
      setListError(errorMessage(e));
    }
  };

  const confirmDeleteList = () =>
    Alert.alert(t('deleteListTitle'), t('deleteListBody', { title: list.title }), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('deleteList'),
        style: 'destructive',
        onPress: () =>
          deleteList(id, list.code)
            .then(() => goLists())
            .catch((e) => setListError(errorMessage(e))),
      },
    ]);

  const invite = () => {
    const url = Linking.createURL('join', { queryParams: { code: list.code } });
    return Share.share({ message: t('shareMessage', { title: list.title, code: list.code, url }) });
  };

  return (
    <Screen footer={<Button label={t('addWishButton')} onPress={() => router.push({ pathname: '/wish', params: { list: id } })} />}>
      <Stack.Screen options={headerSide('right', <Button small label={t('invite')} onPress={invite} />)} />
      {editingList ? (
        <Card>
          <T kind="name">{t('editList')}</T>
          <Field placeholder={t('titlePlaceholder')} autoCapitalize="sentences" value={title} onChangeText={setTitle} />
          <DateField value={date} onChange={setDate} />
          {listError ? <T kind="error">{listError}</T> : null}
          <Button label={t('saveList')} onPress={saveList} />
          <Button variant="quiet" label={t('cancel')} onPress={() => setEditingList(false)} />
        </Card>
      ) : (
        <HeroCard list={list} />
      )}
      <View style={{ paddingHorizontal: 4, paddingTop: 2 }}>
        <T kind="sub">{t('claimsWrapped')}</T>
      </View>
      {items.length === 0 ? (
        <Card>
          <T kind="name">{t('noWishes')}</T>
          <T kind="sub">{t('noWishesSub')}</T>
        </Card>
      ) : null}
      {items.map((i) => (
        <View key={i.id} style={{ flexDirection: 'row', gap: 14, alignItems: 'center', padding: 10, borderRadius: 20, backgroundColor: th.card }}>
          <Pressable onPress={() => Linking.openURL(i.links[0])} accessibilityRole="link" accessibilityLabel={t('openItem', { name: i.name })}>
            <ItemImage id={i.id} uri={i.image} style={{ width: 64, height: 64, borderRadius: 14 }} />
          </Pressable>
          <View style={{ flex: 1, minWidth: 0 }}>
            <T kind="name">{i.name}</T>
            <LinkDomains links={i.links} />
          </View>
          <IconButton label={t('editItem', { name: i.name })} onPress={() => router.push({ pathname: '/wish', params: { list: id, item: i.id } })}>
            <PencilIcon color={th.primary} />
          </IconButton>
        </View>
      ))}
      {listError && !editingList ? <T kind="error">{listError}</T> : null}
      {editingList ? null : (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 8 }}>
          <Button small variant="quiet" label={t('editList')} onPress={startListEdit} />
          <Button small variant="dangerOutline" label={t('deleteList')} onPress={confirmDeleteList} />
        </View>
      )}
    </Screen>
  );
}
