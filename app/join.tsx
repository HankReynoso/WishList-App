import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { joinList } from '../src/data';
import { Button, Field, Heading, Screen, T } from '../src/ui';

export default function Join() {
  const params = useLocalSearchParams<{ code?: string }>();
  const [code, setCode] = useState(params.code ?? '');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const join = async () => {
    if (!code.trim() || !name.trim()) return setError('Enter the code and your name.');
    setBusy(true);
    try {
      router.replace(`/guest/${await joinList(code, name.trim())}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Heading eyebrow="you're invited" title="Join a list" sub="No account needed. The list owner never sees who claims what." />
      <Field placeholder="Invite code" autoCapitalize="characters" value={code} onChangeText={setCode} />
      <Field placeholder="Your name" autoCapitalize="words" value={name} onChangeText={setName} />
      {error ? <T kind="error">{error}</T> : null}
      <Button busy={busy} label={busy ? 'Joining...' : 'Join'} onPress={join} />
    </Screen>
  );
}
