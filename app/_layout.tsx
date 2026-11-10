import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, Text } from 'react-native';
import { useTheme } from '../src/theme';

function HomeButton() {
  const t = useTheme();
  return (
    <Pressable onPress={() => router.replace('/')} hitSlop={12} accessibilityRole="button" accessibilityLabel="Home">
      <Text style={{ color: t.accent, fontSize: 16, fontWeight: '600' }}>Home</Text>
    </Pressable>
  );
}

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
        <Stack.Screen name="index" options={{ title: 'Gift-Wrapped' }} />
        <Stack.Screen name="lists" options={{ title: 'My lists', headerBackVisible: false }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="list/[id]" options={{ title: 'List' }} />
        <Stack.Screen name="joined" options={{ title: 'My joined lists' }} />
        <Stack.Screen
          name="join"
          options={({ navigation }) => ({
            title: 'Join a list',
            ...(navigation.canGoBack() ? {} : { headerLeft: () => <HomeButton /> }),
          })}
        />
        <Stack.Screen name="guest/[id]" options={{ title: 'Gift-Wrapped', headerBackVisible: false, headerLeft: () => <HomeButton /> }} />
      </Stack>
    </>
  );
}
