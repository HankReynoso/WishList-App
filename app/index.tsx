import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ownerSignIn, sendReset, useUser } from '../src/auth';
import { errorMessage } from '../src/errors';
import { t } from '../src/i18n';
import { Button, Card, Field, Heading, Loading, Screen, T } from '../src/ui';

export default function Home() {
  const { user, ready } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [create, setCreate] = useState(false);
  const [error, setError] = useState('');

  if (!ready) return <Loading />;
  if (user && !user.isAnonymous) return <Redirect href="/lists" />;

  const submit = () => ownerSignIn(email.trim(), password, create).catch((e) => setError(errorMessage(e)));

  const forgot = async () => {
    if (!email.trim()) return setError(t('enterEmailFirst'));
    try {
      await sendReset(email.trim());
      setError(t('resetSent'));
    } catch (e) {
      setError((e as { code?: string }).code === 'auth/invalid-email' ? t('errInvalidEmail') : t('resetFailed'));
    }
  };

  return (
    <Screen>
      <Heading eyebrow={t('signInEyebrow')} title={create ? t('makeAccount') : t('welcomeBack')} sub={t('signInSub')} />
      <Field placeholder={t('email')} keyboardType="email-address" autoComplete="email" value={email} onChangeText={setEmail} />
      <Field placeholder={t('password')} secureTextEntry value={password} onChangeText={setPassword} />
      {error ? <T kind="sub">{error}</T> : null}
      <Button label={create ? t('createAccount') : t('signIn')} onPress={submit} />
      {create ? null : <Button variant="quiet" label={t('forgotPassword')} onPress={forgot} />}
      <Button variant="quiet" label={create ? t('haveAccount') : t('newHere')} onPress={() => setCreate(!create)} />
      <Card style={{ marginTop: 12 }}>
        <T kind="name">{t('invitedTitle')}</T>
        <T kind="sub">{t('invitedSub')}</T>
        <Button label={t('joinWithCode')} onPress={() => router.push('/join')} />
        <Button variant="outline" label={t('myJoinedLists')} onPress={() => router.push('/joined')} />
      </Card>
    </Screen>
  );
}
