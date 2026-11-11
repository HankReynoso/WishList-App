import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { addItem, deleteItem, updateItem, useDocData } from '../src/data';
import { errorMessage } from '../src/errors';
import { parseLinks } from '../src/format';
import { t } from '../src/i18n';
import { fetchPreviewImage } from '../src/preview';
import type { Item } from '../src/types';
import { Button, Field, Heading, headerSide, ItemImage, Loading, Screen, T } from '../src/ui';

export default function Wish() {
  const { list, item } = useLocalSearchParams<{ list: string; item?: string }>();
  const { data, ready } = useDocData<Item>(item ? `lists/${list}/items/${item}` : null);
  if (!ready) return <Loading />;
  return <WishForm listId={list} itemId={item} initial={data} />;
}

function WishForm({ listId, itemId, initial }: { listId: string; itemId?: string; initial: Item | null }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [links, setLinks] = useState(initial?.links.join('\n') ?? '');
  const [status, setStatus] = useState<'idle' | 'finding' | 'saving'>('idle');
  const [error, setError] = useState('');

  const save = async () => {
    const parsed = parseLinks(links);
    if (!name.trim() || parsed.length === 0) return setError(t('needNameAndLink'));
    setError('');
    const keep = initial?.image && initial.links[0] === parsed[0] ? initial.image : undefined;
    let image = keep;
    if (!keep) {
      setStatus('finding');
      image = await fetchPreviewImage(parsed[0]);
    }
    setStatus('saving');
    try {
      const next = { name: name.trim(), links: parsed, image };
      await (itemId ? updateItem(listId, itemId, next) : addItem(listId, next));
      router.back();
    } catch (e) {
      setError(errorMessage(e));
      setStatus('idle');
    }
  };

  const confirmDelete = () =>
    Alert.alert(t('deleteWishTitle'), t('deleteWishBody', { name: initial?.name ?? '' }), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: () =>
          deleteItem(listId, itemId!)
            .then(() => router.back())
            .catch((e) => setError(errorMessage(e))),
      },
    ]);

  return (
    <Screen>
      <Stack.Screen options={headerSide('left', <Button small variant="quiet" label={t('cancel')} onPress={() => router.back()} />)} />
      <Heading
        eyebrow={itemId ? t('wishEyebrowEdit') : t('wishEyebrowNew')}
        title={itemId ? t('editWish') : t('addWish')}
        sub={t('wishSub')}
      />
      {itemId && initial ? <ItemImage id={itemId} uri={initial.image} style={{ height: 160, borderRadius: 22 }} /> : null}
      <Field placeholder={t('wishNamePlaceholder')} autoCapitalize="sentences" value={name} onChangeText={setName} />
      <Field placeholder={t('linksPlaceholder')} multiline keyboardType="url" value={links} onChangeText={setLinks} />
      {error ? <T kind="error">{error}</T> : null}
      <Button
        busy={status !== 'idle'}
        label={status === 'finding' ? t('findingPicture') : status === 'saving' ? t('saving') : itemId ? t('saveWish') : t('addWish')}
        onPress={save}
      />
      {itemId ? <Button variant="dangerOutline" label={t('deleteWish')} onPress={confirmDelete} /> : null}
    </Screen>
  );
}
