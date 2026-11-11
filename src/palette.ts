export type Palette = {
  bg: string;
  card: string;
  text: string;
  sub: string;
  hairline: string;
  primary: string;
  onPrimary: string;
  hero: string;
  heroText: string;
  heroSub: string;
  soft: string;
  tagBg: string;
  tagText: string;
  tints: readonly string[];
  danger: string;
  onDanger: string;
  dangerBg: string;
};

export const palettes = {
  light: {
    bg: '#F1F3EC',
    card: '#FFFFFF',
    text: '#1F2B23',
    sub: '#4E5B52',
    hairline: '#DDE2D6',
    primary: '#24352B',
    onPrimary: '#F1F3EC',
    hero: '#24352B',
    heroText: '#F1F3EC',
    heroSub: '#C9D6C6',
    soft: '#F1F3EC',
    tagBg: '#FFFFFF',
    tagText: '#1F2B23',
    tints: ['#CBD5C6', '#E3D9C8', '#D6DDD0', '#E6DCCD'],
    danger: '#9E3B2A',
    onDanger: '#FFFFFF',
    dangerBg: '#F5E4DF',
  },
  dark: {
    bg: '#121814',
    card: '#1C241E',
    text: '#EEF1EA',
    sub: '#A3AFA5',
    hairline: '#2C362F',
    primary: '#A9C4AE',
    onPrimary: '#121814',
    hero: '#2B3D31',
    heroText: '#F1F3EC',
    heroSub: '#C9D6C6',
    soft: '#26302A',
    tagBg: '#1C241E',
    tagText: '#EEF1EA',
    tints: ['#2C3A31', '#3A3329', '#323C34', '#3D3429'],
    danger: '#E8907E',
    onDanger: '#121814',
    dangerBg: '#3A2420',
  },
} satisfies Record<'light' | 'dark', Palette>;

export const fonts = {
  display: 'Fraunces_600SemiBold',
  name: 'Fraunces_500Medium',
  italic: 'Fraunces_500Medium_Italic',
  body: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  bold: 'DMSans_600SemiBold',
} as const;

// A stable tile color per item, so a placeholder never changes between renders or devices.
export function tintFor(id: string, tints: readonly string[]) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return tints[h % tints.length];
}
