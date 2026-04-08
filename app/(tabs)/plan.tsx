import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UchumiScreen } from '@/src/components/uchumi-screen';
import { colors, TAB_BAR_FLOAT_BOTTOM_OFFSET } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

const LINKS: {
  href:
    | '/plan/budgets'
    | '/plan/goals'
    | '/plan/recurring'
    | '/plan/subscriptions'
    | '/plan/loans'
    | '/plan/calendar'
    | '/stats'
    | '/markets';
  title: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    href: '/plan/budgets',
    title: 'Budgets par catégorie',
    sub: 'Plafonds mensuels et suivi des dépenses',
    icon: 'pie-chart-outline',
  },
  {
    href: '/plan/goals',
    title: 'Objectifs d’épargne',
    sub: 'Cagnottes et montants cibles',
    icon: 'flag-outline',
  },
  {
    href: '/plan/recurring',
    title: 'Mouvements récurrents',
    sub: 'Modèles à appliquer quand c’est dû',
    icon: 'repeat-outline',
  },
  {
    href: '/plan/subscriptions',
    title: 'Abonnements & charges fixes',
    sub: 'Montants, rappels, loyer, prélèvements — prévision budgétaire',
    icon: 'albums-outline',
  },
  {
    href: '/plan/loans',
    title: 'Crédits & dettes',
    sub: 'Suivi manuel des mensualités et reste dû',
    icon: 'card-outline',
  },
  {
    href: '/plan/calendar',
    title: 'Calendrier',
    sub: 'Vue du mois et activité par jour',
    icon: 'calendar-outline',
  },
  {
    href: '/stats',
    title: 'Statistiques',
    sub: 'Graphiques et synthèses',
    icon: 'bar-chart-outline',
  },
  {
    href: '/markets',
    title: 'Marchés',
    sub: 'Cours et vigie',
    icon: 'trending-up-outline',
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
          { paddingBottom: insets.bottom + TAB_BAR_FLOAT_BOTTOM_OFFSET },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="clipboard" size={28} color={colors.ink} />
          </View>
          <Text style={styles.title}>Plan financier</Text>
          <Text style={styles.sub}>
            Tout est stocké sur cet appareil : budgets, objectifs, récurrence et crédits — sans
            serveur.
          </Text>
        </View>

        {LINKS.map((item) => (
          <Pressable
            key={item.href}
            onPress={() => router.push(item.href)}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
            <View style={styles.cardIcon}>
              <Ionicons name={item.icon} size={26} color={colors.accent} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSub}>{item.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
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
  },
  hero: {
    borderRadius: 22,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.dune,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
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
    color: colors.textSecondary,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: colors.dune,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(46,204,113,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 17,
  },
  pressed: {
    opacity: 0.92,
  },
});
