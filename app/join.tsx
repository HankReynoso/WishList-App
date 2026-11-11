import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { joinList } from '../src/data';
import { errorMessage } from '../src/errors';
import { t } from '../src/i18n';
import { Button, Field, Heading, Screen, T } from '../src/ui';

export default function Join() {
  const params = useLocalSearchParams<{ code?: string }>();
  const [code, setCode] = useState(params.code ?? '');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const join = async () => {
    if (!code.trim() || !name.trim()) return setError(t('enterCodeAndName'));
    setBusy(true);
    try {
      router.replace(`/guest/${await joinList(code, name.trim())}`);
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Heading eyebrow={t('joinEyebrow')} title={t('joinTitle')} sub={t('joinSub')} />
      <Field placeholder={t('inviteCode')} autoCapitalize="characters" value={code} onChangeText={setCode} />
      <Field placeholder={t('yourName')} autoCapitalize="words" value={name} onChangeText={setName} />
      {error ? <T kind="error">{error}</T> : null}
      <Button busy={busy} label={busy ? t('joining') : t('join')} onPress={join} />
    </Screen>
  );
}
