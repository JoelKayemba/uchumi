import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { UchumiScreen } from '@/src/components/uchumi-screen';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

/**
 * Modal exemple (Expo Router). Peut servir d’aide ou d’info rapide.
 */
export default function ModalScreen() {
  return (
    <UchumiScreen style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="information-circle" size={40} color={colors.accent} />
        </View>
        <Text style={styles.title}>UCHUMI</Text>
        <Text style={styles.body}>
          Cette fenêtre est un modal de démonstration. Vous pouvez la remplacer par une aide
          contextuelle, un résumé ou un rappel.
        </Text>
        <Link href="/(app)/(tabs)" dismissTo asChild>
          <Pressable style={({ pressed }) => [styles.btn, pressed && styles.pressed]}>
            <Text style={styles.btnLabel}>Retour à l’accueil</Text>
            <Ionicons name="home" size={18} color={colors.textPrimary} />
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
    alignItems: 'center',
  },
  iconWrap: {
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 2,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    backgroundColor: colors.fuscousGray,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
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
