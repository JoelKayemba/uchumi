import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UchumiScreen } from '@/src/components/uchumi-screen';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

const LINKS: {
  href: '/plan/budgets' | '/plan/goals' | '/plan/recurring' | '/plan/loans' | '/plan/calendar';
  title: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
  grad: readonly [string, string];
}[] = [
  {
    href: '/plan/budgets',
    title: 'Budgets par catégorie',
    sub: 'Plafonds mensuels et suivi des dépenses',
    icon: 'pie-chart-outline',
    grad: ['#4a6670', '#2f3d42'],
  },
  {
    href: '/plan/goals',
    title: 'Objectifs d’épargne',
    sub: 'Cagnottes et montants cibles',
    icon: 'flag-outline',
    grad: ['#5c4a6b', '#352a40'],
  },
  {
    href: '/plan/recurring',
    title: 'Mouvements récurrents',
    sub: 'Abonnements, loyers, rappels à valider',
    icon: 'repeat-outline',
    grad: ['#4a6b5a', '#263830'],
  },
  {
    href: '/plan/loans',
    title: 'Crédits & dettes',
    sub: 'Suivi manuel des mensualités et reste dû',
    icon: 'card-outline',
    grad: ['#6b5a4a', '#3d3228'],
  },
  {
    href: '/plan/calendar',
    title: 'Calendrier',
    sub: 'Vue du mois et activité par jour',
    icon: 'calendar-outline',
    grad: ['#3d4f5c', '#2a3038'],
  },
];

export default function PlanTabScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <UchumiScreen style={styles.wrap}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 88 },
        ]}
        showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#2d3540', '#1a1e24']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="clipboard" size={28} color={colors.textPrimary} />
          </View>
          <Text style={styles.title}>Plan financier</Text>
          <Text style={styles.sub}>
            Tout est stocké sur cet appareil : budgets, objectifs, récurrence et crédits — sans
            serveur.
          </Text>
        </LinearGradient>

        {LINKS.map((item) => (
          <Pressable
            key={item.href}
            onPress={() => router.push(item.href)}
            style={({ pressed }) => [pressed && styles.pressed]}>
            <LinearGradient
              colors={[...item.grad]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}>
              <Ionicons name={item.icon} size={26} color={colors.textPrimary} />
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSub}>{item.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.accent} />
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>
    </UchumiScreen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingTop: spacing.md,
  },
  scroll: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  hero: {
    borderRadius: 22,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  sub: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(244,241,238,0.65)',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: spacing.sm,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  cardSub: {
    fontSize: 12,
    color: 'rgba(244,241,238,0.7)',
    marginTop: 4,
    lineHeight: 17,
  },
  pressed: {
    opacity: 0.92,
  },
});
