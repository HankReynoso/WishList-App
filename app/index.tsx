import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ownerSignIn, useUser } from '../src/auth';
import { Button, Field, Screen, T } from '../src/ui';

export default function Home() {
  const { user, ready } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [create, setCreate] = useState(false);
  const [error, setError] = useState('');

  if (!ready) return null;
  if (user && !user.isAnonymous) return <Redirect href="/lists" />;

  const submit = () => ownerSignIn(email.trim(), password, create).catch((e: Error) => setError(e.message));

  return (
    <Screen>
      <T kind="title">Gift-Wrapped</T>
      <T kind="sub">Owners sign in to build lists. Guests join with an invite code.</T>
      <Field placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <Field placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      {error ? <T kind="sub">{error}</T> : null}
      <Button label={create ? 'Create owner account' : 'Sign in'} onPress={submit} />
      <Button label={create ? 'I already have an account' : 'New owner? Create an account'} onPress={() => setCreate(!create)} />
      <Button label="Join with a code" onPress={() => router.push('/join')} />
    </Screen>
  );
}
