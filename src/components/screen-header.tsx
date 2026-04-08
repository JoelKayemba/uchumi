import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

const SIDE = 44;

type Props = {
  title: string;
  onBack?: () => void;
  /** Action optionnelle à droite (icône, bouton). */
  right?: ReactNode;
};

export function ScreenHeader({ title, onBack, right }: Props) {
  const router = useRouter();
  const goBack = onBack ?? (() => router.back());

  return (
    <View style={styles.wrap} accessibilityRole="header">
      <View style={styles.side}>
        <Pressable
          onPress={goBack}
          hitSlop={12}
          style={({ pressed }) => [styles.backHit, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Retour">
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.side, styles.sideRight]}>
        {right != null ? right : <View style={styles.sidePlaceholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    minHeight: SIDE,
  },
  side: {
    width: SIDE,
    justifyContent: 'center',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  sidePlaceholder: {
    width: 24,
    height: 24,
  },
  backHit: {
    paddingVertical: 4,
    paddingRight: 8,
  },
  pressed: {
    opacity: 0.75,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
});
