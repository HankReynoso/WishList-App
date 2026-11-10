import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, TextInput, View, type TextInputProps } from 'react-native';
import { useTheme } from './theme';

export function Screen({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ padding: 16, gap: 10 }} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

export function T({ kind = 'body', children }: { kind?: 'title' | 'name' | 'body' | 'sub'; children: ReactNode }) {
  const t = useTheme();
  const style = {
    title: { fontSize: 24, fontWeight: '700' as const, color: t.text },
    name: { fontSize: 15, fontWeight: '600' as const, color: t.text },
    body: { fontSize: 15, color: t.text },
    sub: { fontSize: 13, color: t.sub },
  }[kind];
  return <Text style={style}>{children}</Text>;
}

export function Card({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <View
      style={{
        backgroundColor: t.card,
        borderColor: t.cardBorder,
        borderWidth: 1,
        borderRadius: t.cardRadius,
        padding: 12,
        gap: 8,
      }}
    >
      {children}
    </View>
  );
}

export function Button({ label, onPress }: { label: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} style={{ backgroundColor: t.accent, padding: 14, borderRadius: t.cardRadius, alignItems: 'center' }}>
      <Text style={{ color: t.onAccent, fontWeight: '600', fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, mine, onPress }: { label: string; mine?: boolean; onPress?: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={{ alignSelf: 'flex-start', backgroundColor: mine ? t.mineBg : t.chipBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}
    >
      <Text style={{ color: mine ? t.mineText : t.chipText, fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps) {
  const t = useTheme();
  return (
    <TextInput
      placeholderTextColor={t.sub}
      autoCapitalize="none"
      {...props}
      style={[{ backgroundColor: t.inputBg, color: t.text, borderRadius: t.cardRadius, padding: 12, fontSize: 15 }, props.style]}
    />
  );
}
