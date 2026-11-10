// Per-weight imports: the package index requires every weight, which would ship all of them.
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold';
import { Fraunces_500Medium } from '@expo-google-fonts/fraunces/500Medium';
import { Fraunces_500Medium_Italic } from '@expo-google-fonts/fraunces/500Medium_Italic';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { useFonts } from 'expo-font';
import { router, SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, Text } from 'react-native';
import { fonts, useTheme } from '../src/theme';

SplashScreen.preventAutoHideAsync();

function HomeButton() {
  const t = useTheme();
  return (
    <Pressable onPress={() => router.replace('/')} hitSlop={12} accessibilityRole="button" accessibilityLabel="Home">
      <Text style={{ color: t.primary, fontFamily: fonts.medium, fontSize: 15 }}>Home</Text>
    </Pressable>
  );
}

export default function Root() {
  const t = useTheme();
  const [loaded, error] = useFonts({
    Fraunces_500Medium,
    Fraunces_500Medium_Italic,
    Fraunces_600SemiBold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
  });
  // A font load error falls back to system fonts rather than a stuck splash.
  const ready = loaded || !!error;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);
  if (!ready) return null;

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          title: 'Gift-Wrapped',
          headerStyle: { backgroundColor: t.bg },
          headerTintColor: t.primary,
          headerTitleStyle: { fontFamily: fonts.italic, fontSize: 17, color: t.primary },
          headerShadowVisible: false,
          headerTitleAlign: 'center',
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: t.bg },
        }}
      >
        <Stack.Screen name="lists" options={{ headerBackVisible: false }} />
        <Stack.Screen name="wish" options={{ presentation: 'modal' }} />
        <Stack.Screen
          name="join"
          options={({ navigation }) => (navigation.canGoBack() ? {} : { headerLeft: () => <HomeButton /> })}
        />
        <Stack.Screen name="guest/[id]" options={{ headerBackVisible: false, headerLeft: () => <HomeButton /> }} />
      </Stack>
    </>
  );
}
