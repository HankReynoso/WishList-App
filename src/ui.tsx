import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useState, type ReactElement, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useColorScheme,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { domain, formatDate, fromDateString, toDateString } from './format';
import { dateLocale, t } from './i18n';
import { GiftIcon } from './icons';
import { tintFor } from './palette';
import { fonts, useTheme } from './theme';

export function Screen({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  const th = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: th.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: footer ? 24 : 120, gap: 12 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        automaticallyAdjustKeyboardInsets
      >
        {children}
      </ScrollView>
      {footer ? <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16) }}>{footer}</View> : null}
    </View>
  );
}

export function Heading({ eyebrow, title, sub }: { eyebrow?: string; title: string; sub?: string }) {
  const th = useTheme();
  return (
    <View style={{ paddingTop: 4, paddingBottom: 4 }}>
      {eyebrow ? <Text style={{ fontFamily: fonts.italic, fontSize: 15, color: th.sub }}>{eyebrow}</Text> : null}
      <Text accessibilityRole="header" style={{ fontFamily: fonts.display, fontSize: 32, lineHeight: 36, color: th.text, marginTop: 2 }}>
        {title}
      </Text>
      {sub ? <Text style={{ fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: th.sub, marginTop: 8 }}>{sub}</Text> : null}
    </View>
  );
}

type Kind = 'name' | 'body' | 'sub' | 'error';

export function T({ kind = 'body', children }: { kind?: Kind; children: ReactNode }) {
  const th = useTheme();
  const style = {
    name: { fontFamily: fonts.name, fontSize: 17, lineHeight: 21, color: th.text },
    body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: th.text },
    sub: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: th.sub },
    error: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: th.danger },
  }[kind];
  return (
    <Text style={style} accessibilityLiveRegion={kind === 'error' ? 'polite' : undefined}>
      {children}
    </Text>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const th = useTheme();
  return <View style={[{ backgroundColor: th.card, borderRadius: 22, padding: 16, gap: 10 }, style]}>{children}</View>;
}

type Variant = 'primary' | 'outline' | 'quiet' | 'danger' | 'dangerOutline';

export function Button({
  label,
  onPress,
  variant = 'primary',
  small,
  busy,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  small?: boolean;
  busy?: boolean;
}) {
  const th = useTheme();
  const look = {
    primary: { bg: th.primary, fg: th.onPrimary, border: th.primary },
    outline: { bg: 'transparent', fg: th.primary, border: th.primary },
    quiet: { bg: 'transparent', fg: th.primary, border: 'transparent' },
    danger: { bg: th.danger, fg: th.onDanger, border: th.danger },
    dangerOutline: { bg: 'transparent', fg: th.danger, border: th.danger },
  }[variant];
  const height = small ? 44 : 52;
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityState={{ busy: !!busy }}
      style={({ pressed }) => ({
        height,
        borderRadius: height / 2,
        paddingHorizontal: small ? 18 : 22,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: small ? 'flex-start' : 'stretch',
        backgroundColor: look.bg,
        borderWidth: 1,
        borderColor: look.border,
        opacity: pressed || busy ? 0.7 : 1,
      })}
    >
      <Text style={{ color: look.fg, fontFamily: fonts.bold, fontSize: small ? 13 : 15 }}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({ label, onPress, children }: { label: string; onPress: () => void; children: ReactNode }) {
  const th = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={4}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: th.soft,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {children}
    </Pressable>
  );
}

export function Field(props: TextInputProps) {
  const th = useTheme();
  return (
    <TextInput
      placeholderTextColor={th.sub}
      autoCapitalize="none"
      returnKeyType="done"
      {...props}
      style={[
        {
          backgroundColor: th.card,
          color: th.text,
          borderColor: th.hairline,
          borderWidth: 1,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          minHeight: 52,
          fontFamily: fonts.body,
          fontSize: 15,
        },
        props.multiline ? { minHeight: 96, textAlignVertical: 'top' } : null,
        props.style,
      ]}
    />
  );
}

export function DateField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const th = useTheme();
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <Pressable
          onPress={() => setOpen((o) => !o)}
          accessibilityRole="button"
          style={{
            flex: 1,
            minHeight: 52,
            justifyContent: 'center',
            backgroundColor: th.card,
            borderColor: th.hairline,
            borderWidth: 1,
            borderRadius: 16,
            paddingHorizontal: 16,
          }}
        >
          <Text style={{ color: value ? th.text : th.sub, fontFamily: fonts.body, fontSize: 15 }}>{value ? formatDate(value, { year: 'numeric', month: 'short', day: 'numeric' }) : t('dateOptional')}</Text>
        </Pressable>
        {value ? (
          <Button
            small
            variant="quiet"
            label={t('clear')}
            onPress={() => {
              setOpen(false);
              onChange('');
            }}
          />
        ) : null}
      </View>
      {open ? (
        <DateTimePicker
          mode="date"
          locale={dateLocale}
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          themeVariant={scheme}
          accentColor={th.primary}
          value={value ? fromDateString(value) : new Date()}
          onChange={(e, d) => {
            if (Platform.OS !== 'ios') setOpen(false);
            if (e.type === 'set' && d) onChange(toDateString(d));
          }}
        />
      ) : null}
    </View>
  );
}

// The tinted tile shows until the image loads, and stays when there is no
// image or it fails, so a dead store CDN never leaves a blank hole.
export function ItemImage({ id, uri, style }: { id: string; uri?: string; style: StyleProp<ViewStyle> }) {
  const th = useTheme();
  const [failed, setFailed] = useState<string | null>(null);
  const show = uri && failed !== uri;
  return (
    <View style={[{ backgroundColor: tintFor(id, th.tints), alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, style]}>
      <GiftIcon color={th.sub} size={22} />
      {show ? (
        <Image
          source={{ uri }}
          contentFit="cover"
          transition={150}
          accessible={false}
          onError={() => setFailed(uri)}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
      ) : null}
    </View>
  );
}

export function GiftTag({ label, mine }: { label: string; mine?: boolean }) {
  const th = useTheme();
  const bg = mine ? th.primary : th.tagBg;
  const fg = mine ? th.onPrimary : th.tagText;
  return (
    <View
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        paddingVertical: 6,
        paddingLeft: 9,
        paddingRight: 12,
        backgroundColor: bg,
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
        borderTopRightRadius: 14,
        borderBottomRightRadius: 14,
      }}
    >
      <View style={{ width: 5, height: 5, borderRadius: 3, borderWidth: 1, borderColor: fg }} />
      <Text style={{ color: fg, fontFamily: fonts.bold, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

export function LinkDomains({ links }: { links: string[] }) {
  const th = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 3 }}>
      {links.map((u, i) => (
        <Pressable key={u} onPress={() => Linking.openURL(u)} hitSlop={8} accessibilityRole="link" accessibilityLabel={t('openDomain', { domain: domain(u) })}>
          <Text style={{ fontFamily: fonts.body, fontSize: 12, lineHeight: 18, color: th.sub }}>
            {i > 0 ? ' · ' : ''}
            <Text style={{ textDecorationLine: 'underline' }}>{domain(u)}</Text>
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// iOS 26 wraps header items in a shared glass capsule, which washes out our
// own pills. The items API lets us opt out; headerLeft/Right serve Android.
export function headerSide(side: 'left' | 'right', element: ReactElement) {
  const items = () => [{ type: 'custom' as const, element, hidesSharedBackground: true }];
  return side === 'left'
    ? { headerLeft: () => element, unstable_headerLeftItems: items }
    : { headerRight: () => element, unstable_headerRightItems: items };
}

export function Loading() {
  const th = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: th.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={th.primary} />
    </View>
  );
}
