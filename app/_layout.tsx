import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../src/theme';

export default function Root() {
  const t = useTheme();
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: t.bg },
          headerTintColor: t.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: t.bg },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Wishlist' }} />
        <Stack.Screen name="lists" options={{ title: 'My lists', headerBackVisible: false }} />
        <Stack.Screen name="list/[id]" options={{ title: 'List' }} />
        <Stack.Screen name="join" options={{ title: 'Join a list' }} />
        <Stack.Screen name="guest/[id]" options={{ title: 'Wishlist', headerBackVisible: false }} />
      </Stack>
    </>
  );
}
