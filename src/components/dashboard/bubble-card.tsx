import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

type BubbleCardProps = {
  children: ReactNode;
  style?: ViewStyle;
  /** Variante visuelle. */
  variant?: 'default' | 'accent' | 'deep';
};

const GRADIENTS: Record<
  NonNullable<BubbleCardProps['variant']>,
  readonly [string, string]
> = {
  default: ['#FFFFFF', '#FAFAFC'],
  accent: ['#FFFFFF', '#F0FDF4'],
  deep: ['#FFFFFF', '#F7F5FC'],
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
    borderColor: colors.fuscousGray,
    backgroundColor: colors.dune,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  gradient: {
    padding: spacing.lg,
  },
});
