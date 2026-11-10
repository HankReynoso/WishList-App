import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ownerSignIn, sendReset, useUser } from '../src/auth';
import { Button, Chip, Field, Screen, T } from '../src/ui';

export default function Home() {
  const { user, ready } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [create, setCreate] = useState(false);
  const [error, setError] = useState('');

  if (!ready) return null;
  if (user && !user.isAnonymous) return <Redirect href="/lists" />;

  const submit = () => ownerSignIn(email.trim(), password, create).catch((e: Error) => setError(e.message));

  const forgot = async () => {
    if (!email.trim()) return setError('Enter your email above, then tap Forgot password.');
    try {
      await sendReset(email.trim());
      setError('If an account exists for that email, a password reset link is on its way.');
    } catch (e) {
      setError((e as { code?: string }).code === 'auth/invalid-email' ? 'Enter a valid email address.' : 'Could not send the reset email. Try again.');
    }
  };

  return (
    <Screen>
      <T kind="title">Gift-Wrapped</T>
      <T kind="sub">Owners sign in to build lists. Guests join with an invite code.</T>
      <Field placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <Field placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      {error ? <T kind="sub">{error}</T> : null}
      {create ? null : <Chip label="Forgot password?" onPress={forgot} />}
      <Button label={create ? 'Create owner account' : 'Sign in'} onPress={submit} />
      <Button label={create ? 'I already have an account' : 'New owner? Create an account'} onPress={() => setCreate(!create)} />
      <Button label="Join with a code" onPress={() => router.push('/join')} />
      <Button label="My joined lists" onPress={() => router.push('/joined')} />
    </Screen>
  );
}
