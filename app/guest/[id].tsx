import * as Linking from 'expo-linking';
import { useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useUser } from '../../src/auth';
import { claimItem, unclaimItem, useCollectionData, useDocData } from '../../src/data';
import { countdown } from '../../src/format';
import { t } from '../../src/i18n';
import type { Claim, Guest, Item, ListDoc } from '../../src/types';
import { Button, Card, GiftTag, Heading, ItemImage, LinkDomains, Loading, Screen, T } from '../../src/ui';

export default function GuestList() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useUser();
  const { data: list } = useDocData<ListDoc>(`lists/${id}`);
  const { data: me } = useDocData<Guest>(user ? `lists/${id}/guests/${user.uid}` : null);
  const items = useCollectionData<Item>(`lists/${id}/items`).slice().sort((a, b) => a.name.localeCompare(b.name));
  const claims = new Map(useCollectionData<Claim>(`lists/${id}/claims`).map((c) => [c.id, c]));

  if (!list || !user || !me) return <Loading />;

  const sub = [list.date ? countdown(list.date) : null, t('youAre', { name: me.name }), t('ownerCantSee')]
    .filter(Boolean)
    .join(' · ');

  return (
    <Screen>
      <Heading eyebrow={list.title} title={t('guestTitle')} sub={sub} />
      {items.length === 0 ? (
        <Card>
          <T kind="sub">{t('guestEmpty')}</T>
        </Card>
      ) : null}
      {items.map((i) => {
        const claim = claims.get(i.id);
        const mine = claim?.guestId === user.uid;
        return (
          <Card key={i.id} style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
            <Pressable onPress={() => Linking.openURL(i.links[0])} accessibilityRole="link" accessibilityLabel={t('openItem', { name: i.name })}>
              <ItemImage id={i.id} uri={i.image} style={{ height: 120 }} />
              {claim ? <GiftTag mine={mine} label={mine ? t('gettingMine') : t('gettingOther', { name: claim.guestName })} /> : null}
            </Pressable>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 14 }}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <T kind="name">{i.name}</T>
                <LinkDomains links={i.links} />
              </View>
              {!claim ? (
                <Button small label={t('claim')} onPress={() => claimItem(id, i.id, user.uid, me.name).catch(() => {})} />
              ) : mine ? (
                <Button small variant="outline" label={t('undo')} onPress={() => unclaimItem(id, i.id)} />
              ) : null}
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}
