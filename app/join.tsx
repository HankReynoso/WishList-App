import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { joinList } from '../src/data';
import { Button, Field, Screen, T } from '../src/ui';

export default function Join() {
  const params = useLocalSearchParams<{ code?: string }>();
  const [code, setCode] = useState(params.code ?? '');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const join = async () => {
    if (!code.trim() || !name.trim()) return setError('Enter the code and your name.');
    try {
      router.replace(`/guest/${await joinList(code, name.trim())}`);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <Screen>
      <T kind="sub">No account needed. The list owner never sees who claims what.</T>
      <Field placeholder="Invite code" autoCapitalize="characters" value={code} onChangeText={setCode} />
      <Field placeholder="Your name" autoCapitalize="words" value={name} onChangeText={setName} />
      {error ? <T kind="sub">{error}</T> : null}
      <Button label="Join" onPress={join} />
    </Screen>
  );
}
