import { type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

type QuickActionTileProps = {
  label: string;
  onPress: () => void;
  icon: ReactNode;
  /** Conservé pour compat ; optionnel (accent léger). */
  colorsGrad?: readonly [string, string];
};

export function QuickActionTile({
  label,
  onPress,
  icon,
}: QuickActionTileProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.press, pressed && styles.pressed]}>
      <View style={styles.tile}>
        <View style={styles.iconWrap}>{icon}</View>
        <Text style={styles.label} numberOfLines={2}>
          {label}
        </Text>
      </View>
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
    borderColor: colors.fuscousGray,
    borderRadius: 18,
    backgroundColor: colors.dune,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
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
