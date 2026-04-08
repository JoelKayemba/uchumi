import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UchumiScreen } from '@/src/components/uchumi-screen';
import { useAppStore } from '@/src/store/use-app-store';
import type { AppMode } from '@/src/types/app';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

export default function ModeChoiceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const setAppMode = useAppStore((s) => s.setAppMode);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const choose = (mode: AppMode) => {
    setAppMode(mode);
    completeOnboarding();
    router.replace('/(app)/(tabs)');
  };

  return (
    <UchumiScreen style={styles.container}>
      <LinearGradient
        colors={['transparent', 'rgba(237,232,255,0.35)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          StyleSheet.absoluteFill,
          { top: -insets.top - 8 },
        ]}
        pointerEvents="none"
      />
      <Text style={styles.kicker}>Étape 2 / 2</Text>
      <Text style={styles.title}>Comment utilisez-vous UCHUMI ?</Text>
      <Text style={styles.subtitle}>
        Vous pourrez ajuster plus tard dans les réglages. Ce choix adapte les libellés et l’accent
        mis sur l’interface.
      </Text>

      <View style={styles.cards}>
        <Pressable
          style={({ pressed }) => [styles.cardPress, pressed && styles.cardPressed]}
          onPress={() => choose('personal')}>
          <LinearGradient
            colors={['#4a5a6e', '#2d3540']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}>
            <View style={styles.cardIcon}>
              <Ionicons name="person" size={28} color={colors.textOnDark} />
            </View>
            <Text style={styles.cardTitle}>Personnel</Text>
            <Text style={styles.cardDesc}>
              Budget du quotidien, dépenses, épargne et objectifs personnels.
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardCta}>Continuer</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.lime} />
            </View>
          </LinearGradient>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.cardPress, pressed && styles.cardPressed]}
          onPress={() => choose('business')}>
          <LinearGradient
            colors={['#5c4a6b', '#352a40']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}>
            <View style={styles.cardIcon}>
              <Ionicons name="briefcase" size={28} color={colors.textOnDark} />
            </View>
            <Text style={styles.cardTitle}>Activité</Text>
            <Text style={styles.cardDesc}>
              Ventes, charges, vision « pro » tout en gardant une vue d’ensemble.
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardCta}>Continuer</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.lime} />
            </View>
          </LinearGradient>
        </Pressable>
      </View>
    </UchumiScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  cards: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cardPress: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  card: {
    padding: spacing.lg,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: spacing.sm,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textOnDark,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textOnDarkSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: spacing.sm,
  },
  cardCta: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.lime,
  },
});
