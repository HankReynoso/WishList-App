import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { deleteAccount } from '../src/account';
import { useUser } from '../src/auth';
import { errorMessage } from '../src/errors';
import { t } from '../src/i18n';
import { goHome } from '../src/nav';
import { Button, Card, Field, Heading, Loading, Screen, T } from '../src/ui';

export default function Settings() {
  const { user, ready } = useUser();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!ready) return <Loading />;
  if (!user || user.isAnonymous) return <Redirect href="/" />;

  const run = async () => {
    setBusy(true);
    try {
      await deleteAccount(user, password);
      goHome();
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  };

  const confirm = () => {
    if (!password) return setError(t('enterPasswordConfirm'));
    setError('');
    Alert.alert(
      t('deleteAccountTitle'),
      t('deleteAccountBody'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('deleteAccount'), style: 'destructive', onPress: run },
      ],
    );
  };

  return (
    <Screen>
      <Heading eyebrow={t('signedInAs')} title={t('settings')} sub={user.email ?? undefined} />
      <Card>
        <T kind="name">{t('deleteAccount')}</T>
        <T kind="sub">{t('deleteAccountSub')}</T>
        <Field placeholder={t('password')} secureTextEntry value={password} onChangeText={setPassword} />
        {error ? <T kind="error">{error}</T> : null}
        <Button variant="danger" busy={busy} label={busy ? t('deleting') : t('deleteAccount')} onPress={confirm} />
      </Card>
    </Screen>
  );
}
