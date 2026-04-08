import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UchumiScreen } from '@/src/components/uchumi-screen';
import { formatIsoTotals, availableByIso } from '@/src/lib/multi-currency';
import { useAppStore } from '@/src/store/use-app-store';
import { finShell } from '@/src/theme/fin-shell';
import { TAB_BAR_FLOAT_BOTTOM_OFFSET } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

const GRID: {
  href:
    | '/plan/budgets'
    | '/plan/goals'
    | '/plan/recurring'
    | '/plan/subscriptions';
  title: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  {
    href: '/plan/budgets',
    title: 'Budgets',
    sub: 'Plafonds par catégorie',
    icon: 'pie-chart-outline',
    color: finShell.purple,
  },
  {
    href: '/plan/goals',
    title: 'Objectifs',
    sub: 'Épargne cible',
    icon: 'flag-outline',
    color: finShell.blue,
  },
  {
    href: '/plan/recurring',
    title: 'Récurrences',
    sub: 'Modèles réutilisables',
    icon: 'repeat-outline',
    color: finShell.green,
  },
  {
    href: '/plan/subscriptions',
    title: 'Abonnements',
    sub: 'Charges fixes',
    icon: 'albums-outline',
    color: finShell.orange,
  },
];

const MORE: {
  href:
    | '/portfolio'
    | '/plan/loans'
    | '/plan/calendar'
    | '/stats'
    | '/markets'
    | '/insights/upcoming-expenses';
  title: string;
  sub: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    href: '/portfolio',
    title: 'Portefeuille',
    sub: 'Solde, courbe du mois, mouvements',
    icon: 'wallet-outline',
  },
  {
    href: '/plan/loans',
    title: 'Crédits & dettes',
    sub: 'Mensualités et reste dû',
    icon: 'card-outline',
  },
  {
    href: '/plan/calendar',
    title: 'Calendrier',
    sub: 'Activité par jour',
    icon: 'calendar-outline',
  },
  {
    href: '/stats',
    title: 'Analyse des dépenses',
    sub: 'Statistiques et prévisions',
    icon: 'analytics-outline',
  },
  {
    href: '/insights/upcoming-expenses',
    title: 'Charges à venir',
    sub: 'Abonnements et récurrences',
    icon: 'time-outline',
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
  const transactions = useAppStore((s) => s.transactions);
  const balanceByIso = useMemo(() => availableByIso(transactions), [transactions]);
  const balanceLabel = useMemo(() => formatIsoTotals(balanceByIso), [balanceByIso]);

  return (
    <UchumiScreen style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + TAB_BAR_FLOAT_BOTTOM_OFFSET },
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Plan financier</Text>
        <Text style={styles.balanceLabel}>Solde principal</Text>
        <Text style={styles.balance}>{balanceLabel}</Text>
        <Text style={styles.disclaimer}>
          Données locales — budgets, objectifs, récurrence et crédits.
        </Text>

        <View style={styles.quickRow}>
          <QuickCircle
            icon="add"
            label="Ajouter"
            onPress={() => router.push('/transaction/new')}
          />
          <QuickCircle
            icon="wallet-outline"
            label="Portefeuille"
            onPress={() => router.push('/portfolio')}
          />
          <QuickCircle
            icon="bar-chart-outline"
            label="Analyse"
            onPress={() => router.push('/stats')}
          />
          <QuickCircle
            icon="pie-chart-outline"
            label="Budgets"
            onPress={() => router.push('/plan/budgets')}
          />
        </View>

        <Text style={styles.section}>Raccourcis</Text>
        <View style={styles.grid}>
          {GRID.map((item) => (
            <Pressable
              key={item.href}
              onPress={() => router.push(item.href)}
              style={({ pressed }) => [
                styles.tile,
                pressed && styles.pressed,
                { backgroundColor: item.color },
              ]}>
              <View style={styles.tileInner}>
                <View style={styles.tileTop}>
                  <View style={styles.tileIconBg}>
                    <Ionicons name={item.icon} size={22} color="#FFFFFF" />
                  </View>
                  <Ionicons name="arrow-forward" size={18} color="rgba(255,255,255,0.88)" />
                </View>
                <Text style={styles.tileTitle}>{item.title}</Text>
                <Text style={styles.tileSub}>{item.sub}</Text>
                <Text style={styles.tileAmt}>Ouvrir</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Text style={styles.section}>Tout le plan</Text>
        {MORE.map((item) => (
          <Pressable
            key={item.href}
            onPress={() => router.push(item.href)}
            style={({ pressed }) => [styles.listRow, pressed && styles.pressed]}>
            <View style={styles.listIcon}>
              <Ionicons name={item.icon} size={22} color={finShell.ink} />
            </View>
            <View style={styles.listText}>
              <Text style={styles.listTitle}>{item.title}</Text>
              <Text style={styles.listSub}>{item.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={finShell.muted} />
          </Pressable>
        ))}
      </ScrollView>
    </UchumiScreen>
  );
}

function QuickCircle({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.qHit}>
      <View style={styles.qCircle}>
        <Ionicons name={icon} size={22} color="#FFFFFF" />
      </View>
      <Text style={styles.qLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: finShell.page,
    paddingTop: spacing.md,
  },
  scroll: {
    gap: spacing.md,
  },
  kicker: {
    fontSize: 14,
    fontWeight: '700',
    color: finShell.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceLabel: {
    marginTop: spacing.sm,
    fontSize: 15,
    color: finShell.sub,
    fontWeight: '600',
  },
  balance: {
    fontSize: 40,
    fontWeight: '800',
    color: finShell.ink,
    letterSpacing: -1.2,
    marginTop: 4,
  },
  disclaimer: {
    fontSize: 13,
    color: finShell.muted,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  qHit: {
    alignItems: 'center',
    gap: 8,
    minWidth: 72,
  },
  qCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: finShell.ink,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
  qLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: finShell.sub,
    textAlign: 'center',
  },
  section: {
    fontSize: 18,
    fontWeight: '800',
    color: finShell.ink,
    marginTop: spacing.sm,
    letterSpacing: -0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  tile: {
    width: '48%',
    borderRadius: 24,
    borderWidth: 0,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.07,
        shadowRadius: 16,
      },
      android: { elevation: 3 },
    }),
  },
  tileInner: {
    padding: spacing.md,
    gap: 6,
    minHeight: 156,
  },
  tileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  tileIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tileSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 16,
  },
  tileAmt: {
    marginTop: 'auto',
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 20,
    backgroundColor: finShell.card,
    borderWidth: 1,
    borderColor: finShell.border,
  },
  listIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: finShell.barTrack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listText: { flex: 1 },
  listTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: finShell.ink,
  },
  listSub: {
    fontSize: 12,
    color: finShell.muted,
    marginTop: 4,
    lineHeight: 17,
  },
  pressed: { opacity: 0.92 },
});
