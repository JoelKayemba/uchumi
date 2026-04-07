import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

type QuickActionTileProps = {
  label: string;
  onPress: () => void;
  icon: ReactNode;
  colorsGrad: readonly [string, string];
};

export function QuickActionTile({
  label,
  onPress,
  icon,
  colorsGrad,
}: QuickActionTileProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.press, pressed && styles.pressed]}>
      <LinearGradient
        colors={[...colorsGrad]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.tile}>
        <View style={styles.iconWrap}>{icon}</View>
        <Text style={styles.label} numberOfLines={2}>
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: {
    flex: 1,
    minWidth: '46%',
    maxWidth: '48%',
    borderRadius: 18,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  tile: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    minHeight: 96,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
  },
  iconWrap: {
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
});
