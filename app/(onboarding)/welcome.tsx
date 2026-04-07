import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { UchumiScreen } from '@/src/components/uchumi-screen';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <UchumiScreen style={styles.center}>
      <View style={styles.top}>
        <LinearGradient
          colors={['#3d4f5c', '#2a3038', '#1a1e24']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          <View style={styles.heroIconRow}>
            <View style={styles.iconBubble}>
              <Ionicons name="wallet" size={32} color={colors.textPrimary} />
            </View>
            <View style={[styles.iconBubble, styles.iconBubbleSmall]}>
              <Ionicons name="trending-up" size={22} color={colors.success} />
            </View>
          </View>
          <Text style={styles.logo}>UCHUMI</Text>
          <Text style={styles.tagline}>Votre argent, au quotidien.</Text>
        </LinearGradient>

        <Text style={styles.body}>
          Suivez ce qu’il vous reste, anticipez les dépenses et gardez le contrôle — simplement.
        </Text>

        <View style={styles.features}>
          <View style={styles.featureRow}>
            <Ionicons name="pie-chart-outline" size={20} color={colors.accent} />
            <Text style={styles.featureText}>Vue claire des flux et catégories</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="notifications-outline" size={20} color={colors.accent} />
            <Text style={styles.featureText}>Rappels et alertes optionnelles</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.accent} />
            <Text style={styles.featureText}>Données locales, export JSON</Text>
          </View>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.buttonWrap, pressed && styles.buttonPressed]}
        onPress={() => router.push('/mode-choice')}>
        <LinearGradient
          colors={['#4a6670', '#354248']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}>
          <Text style={styles.buttonLabel}>Commencer</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.textPrimary} />
        </LinearGradient>
      </Pressable>
    </UchumiScreen>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'space-between',
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  top: {
    gap: spacing.lg,
  },
  hero: {
    borderRadius: 24,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heroIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  iconBubble: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBubbleSmall: {
    width: 44,
    height: 44,
    borderRadius: 14,
  },
  logo: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 6,
    color: colors.textPrimary,
  },
  tagline: {
    fontSize: 17,
    color: 'rgba(244,241,238,0.85)',
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textMuted,
  },
  features: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  buttonWrap: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md + 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  buttonLabel: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
});
