import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { spacing } from '@/src/theme/spacing';

type BubbleCardProps = {
  children: ReactNode;
  style?: ViewStyle;
  /** Variante visuelle (dégradé de fond). */
  variant?: 'default' | 'accent' | 'deep';
};

const GRADIENTS: Record<
  NonNullable<BubbleCardProps['variant']>,
  readonly [string, string]
> = {
  default: ['#2A2624', '#1A1816'],
  accent: ['#3D3632', '#252220'],
  deep: ['#1E2A28', '#121816'],
};

export function BubbleCard({ children, style, variant = 'default' }: BubbleCardProps) {
  return (
    <View style={[styles.shell, style]}>
      <LinearGradient
        colors={[...GRADIENTS[variant]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}>
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  gradient: {
    padding: spacing.lg,
  },
});
