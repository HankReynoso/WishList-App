// Per-weight imports: the package index requires every weight, which would ship all of them.
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_600SemiBold } from '@expo-google-fonts/dm-sans/600SemiBold';
import { Fraunces_500Medium } from '@expo-google-fonts/fraunces/500Medium';
import { Fraunces_500Medium_Italic } from '@expo-google-fonts/fraunces/500Medium_Italic';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, Text } from 'react-native';
import { t } from '../src/i18n';
import { goHome } from '../src/nav';
import { fonts, useTheme } from '../src/theme';
import { headerSide } from '../src/ui';

SplashScreen.preventAutoHideAsync();

function HomeButton() {
  const th = useTheme();
  return (
    <Pressable onPress={goHome} hitSlop={12} accessibilityRole="button" accessibilityLabel={t('home')}>
      <Text style={{ color: th.primary, fontFamily: fonts.medium, fontSize: 15 }}>{t('home')}</Text>
    </Pressable>
  );
}

export default function Root() {
  const th = useTheme();
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
          title: t('appName'),
          headerStyle: { backgroundColor: th.bg },
          headerTintColor: th.primary,
          headerTitleStyle: { fontFamily: fonts.italic, fontSize: 17, color: th.primary },
          headerShadowVisible: false,
          headerTitleAlign: 'center',
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: th.bg },
        }}
      >
        <Stack.Screen name="lists" options={{ headerBackVisible: false }} />
        <Stack.Screen name="wish" options={{ presentation: 'modal' }} />
        <Stack.Screen
          name="join"
          options={({ navigation }) => (navigation.canGoBack() ? {} : headerSide('left', <HomeButton />))}
        />
        <Stack.Screen name="guest/[id]" options={{ headerBackVisible: false, ...headerSide('left', <HomeButton />) }} />
      </Stack>
    </>
  );
}
