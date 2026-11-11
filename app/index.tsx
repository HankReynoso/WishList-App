import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ownerSignIn, sendReset, useUser } from '../src/auth';
import { Button, Card, Field, Heading, Loading, Screen, T } from '../src/ui';

export default function Home() {
  const { user, ready } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [create, setCreate] = useState(false);
  const [error, setError] = useState('');

  if (!ready) return <Loading />;
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
      <Heading
        eyebrow="for the list makers"
        title={create ? 'Make your account' : 'Welcome back'}
        sub="Build wishlists and invite guests with a code. Their claims stay a surprise."
      />
      <Field placeholder="Email" keyboardType="email-address" autoComplete="email" value={email} onChangeText={setEmail} />
      <Field placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      {error ? <T kind="sub">{error}</T> : null}
      <Button label={create ? 'Create account' : 'Sign in'} onPress={submit} />
      {create ? null : <Button variant="quiet" label="Forgot password?" onPress={forgot} />}
      <Button variant="quiet" label={create ? 'I already have an account' : 'New here? Create an account'} onPress={() => setCreate(!create)} />
      <Card style={{ marginTop: 12 }}>
        <T kind="name">Invited to a list?</T>
        <T kind="sub">No account needed. Join with the code you were sent.</T>
        <Button label="Join with a code" onPress={() => router.push('/join')} />
        <Button variant="outline" label="My joined lists" onPress={() => router.push('/joined')} />
      </Card>
    </Screen>
  );
}
