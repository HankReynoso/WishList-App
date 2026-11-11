import { useColorScheme } from 'react-native';
import { palettes, type Palette } from './palette';

export { fonts } from './palette';
export type Theme = Palette;

export const useTheme = (): Theme => palettes[useColorScheme() === 'dark' ? 'dark' : 'light'];
