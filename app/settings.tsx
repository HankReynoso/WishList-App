import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { deleteAccount } from '../src/account';
import { useUser } from '../src/auth';
import { Button, Field, Screen, T } from '../src/ui';

export default function Settings() {
  const { user, ready } = useUser();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!ready) return null;
  if (!user || user.isAnonymous) return <Redirect href="/" />;

  const run = async () => {
    setBusy(true);
    try {
      await deleteAccount(user, password);
      router.replace('/');
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  const confirm = () => {
    if (!password) return setError('Enter your password to confirm.');
    setError('');
    Alert.alert(
      'Delete account?',
      'All your lists and items are deleted and your account is removed. Guests lose access. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete account', style: 'destructive', onPress: run },
      ],
    );
  };

  return (
    <Screen>
      <T kind="name">{user.email}</T>
      <T kind="title">Delete account</T>
      <T kind="sub">Enter your password to confirm. This deletes every list you own, then your account.</T>
      <Field placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      {error ? <T kind="sub">{error}</T> : null}
      <Button danger label={busy ? 'Deleting...' : 'Delete account'} onPress={busy ? () => {} : confirm} />
    </Screen>
  );
}
