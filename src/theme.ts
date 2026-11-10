import { useColorScheme } from 'react-native';

export type Theme = {
  bg: string;
  text: string;
  sub: string;
  hairline: string;
  card: string;
  cardBorder: string;
  cardRadius: number;
  accent: string;
  onAccent: string;
  chipBg: string;
  chipText: string;
  mineBg: string;
  mineText: string;
  inputBg: string;
};

export const themes = {
  light: {
    bg: '#ffffff',
    text: '#111111',
    sub: '#6b7280',
    hairline: '#eeeeee',
    card: '#ffffff',
    cardBorder: '#eeeeee',
    cardRadius: 8,
    accent: '#4f46e5',
    onAccent: '#ffffff',
    chipBg: '#f3f4f6',
    chipText: '#444444',
    mineBg: '#eef0ff',
    mineText: '#4f46e5',
    inputBg: '#f3f4f6',
  },
  dark: {
    bg: '#0b0d12',
    text: '#e8eaf0',
    sub: '#9aa3b8',
    hairline: '#262c3c',
    card: '#151925',
    cardBorder: '#262c3c',
    cardRadius: 14,
    accent: '#2dd4bf',
    onAccent: '#06201c',
    chipBg: '#1f2535',
    chipText: '#9aa3b8',
    mineBg: '#2dd4bf22',
    mineText: '#2dd4bf',
    inputBg: '#1f2535',
  },
} satisfies Record<'light' | 'dark', Theme>;

export const useTheme = (): Theme => themes[useColorScheme() === 'dark' ? 'dark' : 'light'];
