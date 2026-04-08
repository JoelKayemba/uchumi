import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { UchumiScreen } from '@/src/components/uchumi-screen';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

/**
 * Raccourci utile : aide, confidentialité, retour accueil.
 */
export default function ModalScreen() {
  return (
    <UchumiScreen style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="help-circle" size={40} color={colors.accent} />
        </View>
        <Text style={styles.title}>Aide rapide</Text>
        <Text style={styles.body}>
          UCHUMI est une app locale : exportez vos données depuis les Réglages avant toute
          réinitialisation importante.
        </Text>
        <Link href="/(app)/support" asChild>
          <Pressable style={({ pressed }) => [styles.btn, pressed && styles.pressed]}>
            <Text style={styles.btnLabel}>FAQ & support</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
          </Pressable>
        </Link>
        <Link href="/(app)/privacy" asChild>
          <Pressable style={({ pressed }) => [styles.btn, pressed && styles.pressed]}>
            <Text style={styles.btnLabel}>Confidentialité</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
          </Pressable>
        </Link>
        <Link href="/(app)/(tabs)" dismissTo asChild>
          <Pressable style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}>
            <Text style={styles.btnPrimaryLabel}>Retour à l’accueil</Text>
            <Ionicons name="home" size={18} color={colors.textOnDark} />
          </Pressable>
        </Link>
      </View>
    </UchumiScreen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.dune,
    borderRadius: 22,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    gap: spacing.md,
    alignItems: 'stretch',
  },
  iconWrap: {
    alignSelf: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    backgroundColor: colors.marshland,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
    marginTop: spacing.sm,
  },
  btnPrimaryLabel: {
    color: colors.textOnDark,
    fontSize: 16,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.88,
  },
  btnLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});
