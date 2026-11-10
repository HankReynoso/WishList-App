import type { ReactNode } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

function Stroke({ size = 18, color, children }: { size?: number; color: string; children: ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </Svg>
  );
}

type IconProps = { size?: number; color: string };

export const PencilIcon = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M12 20h9" />
    <Path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </Stroke>
);

export const GiftIcon = (p: IconProps) => (
  <Stroke {...p}>
    <Rect x={3} y={8} width={18} height={4} rx={1} />
    <Path d="M12 8v13" />
    <Path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
    <Path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" />
  </Stroke>
);

export const ChevronIcon = (p: IconProps) => (
  <Stroke {...p}>
    <Path d="M9 18l6-6-6-6" />
  </Stroke>
);

export const PersonIcon = (p: IconProps) => (
  <Stroke {...p}>
    <Circle cx={12} cy={8} r={4} />
    <Path d="M4 21a8 8 0 0 1 16 0" />
  </Stroke>
);
