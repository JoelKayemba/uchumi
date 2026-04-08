import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DonutLegend, MonthDonut } from '@/src/components/dashboard/month-donut';
import { ScreenHeader } from '@/src/components/screen-header';
import { UchumiScreen } from '@/src/components/uchumi-screen';
import {
  filterTransactionsBetween,
  getLast7DaysWindow,
  totalOutflowDisplay,
} from '@/src/domain/home-insights';
import { buildUpcomingRows } from '@/src/domain/insights-upcoming';
import { useFormatCurrency } from '@/src/hooks/use-format-currency';
import { useAppStore } from '@/src/store/use-app-store';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

export default function UpcomingExpensesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const formatCurrency = useFormatCurrency();
  const displayCurrency = useAppStore((s) => s.currency);
  const transactions = useAppStore((s) => s.transactions);
  const subscriptions = useAppStore((s) => s.subscriptions);
  const recurringRules = useAppStore((s) => s.recurringRules);
  const loans = useAppStore((s) => s.loans);

  const { rows, suggestionCeiling, last7Out } = useMemo(() => {
    const w = getLast7DaysWindow();
    const tx = filterTransactionsBetween(transactions, w.start, w.end);
    const last7Out = totalOutflowDisplay(tx);
    const built = buildUpcomingRows(
      subscriptions,
      recurringRules,
      loans,
      displayCurrency,
      last7Out
    );
    return { ...built, last7Out };
  }, [transactions, subscriptions, recurringRules, loans, displayCurrency]);

  const recurringTotal = useMemo(
    () => rows.reduce((a, r) => a + r.amountDisplay, 0),
    [rows]
  );

  const donutSegments = useMemo(() => {
    const subTotal = rows
      .filter((r) => r.id.startsWith('sub-'))
      .reduce((a, r) => a + r.amountDisplay, 0);
    const recTotal = rows
      .filter((r) => r.id.startsWith('rec-'))
      .reduce((a, r) => a + r.amountDisplay, 0);
    const loanTotal = rows
      .filter((r) => r.id.startsWith('loan-'))
      .reduce((a, r) => a + r.amountDisplay, 0);
    const segs = [
      {
        value: subTotal,
        color: colors.subscriptionPurple,
        label: `Abonnements ${formatCurrency(subTotal)}`,
      },
      {
        value: recTotal,
        color: colors.limeDark,
        label: `Récurrences ${formatCurrency(recTotal)}`,
      },
      {
        value: loanTotal,
        color: colors.tapa,
        label: `Crédits ${formatCurrency(loanTotal)}`,
      },
    ];
    return segs.filter((s) => s.value > 0);
  }, [rows, formatCurrency]);

  return (
    <UchumiScreen style={styles.wrap}>
      <ScreenHeader
        title="Charges à venir"
        right={
          <Pressable
            onPress={() => router.push('/plan/subscriptions')}
            hitSlop={12}
            style={({ pressed }) => [styles.headerIconBtn, pressed && styles.pressed]}>
            <Ionicons name="ellipsis-horizontal" size={22} color={colors.textPrimary} />
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[colors.lavenderCard, colors.dune]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summary}>
          <Text style={styles.summaryLabel}>Plafond indicatif (semaine prochaine)</Text>
          <Text style={styles.summaryTotal}>
            {suggestionCeiling <= 0 ? '—' : `≤ ${formatCurrency(suggestionCeiling)}`}
          </Text>
          <Text style={styles.summaryHint}>
            Basé sur vos sorties des 7 derniers jours (moyenne × 7 + 5 %). Indication seulement.
          </Text>
          <Text style={styles.refLine}>
            Référence 7 jours : {formatCurrency(last7Out)} de sorties
          </Text>
          {donutSegments.length > 0 ? (
            <View style={styles.donutRow}>
              <MonthDonut
                segments={donutSegments}
                centerLabel="Total listé"
                centerValue={formatCurrency(recurringTotal)}
              />
              <DonutLegend segments={donutSegments} />
            </View>
          ) : null}
        </LinearGradient>

        <Text style={styles.quickTitle}>Raccourcis</Text>
        <View style={styles.quickGrid}>
          <Pressable
            onPress={() => router.push('/plan/subscriptions')}
            style={({ pressed }) => [styles.quickCell, pressed && styles.pressed]}>
            <Ionicons name="albums-outline" size={22} color={colors.subscriptionPurple} />
            <Text style={styles.quickLabel}>Abonnements</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/plan/recurring')}
            style={({ pressed }) => [styles.quickCell, pressed && styles.pressed]}>
            <Ionicons name="repeat-outline" size={22} color={colors.subscriptionPurple} />
            <Text style={styles.quickLabel}>Récurrences</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/plan/budgets')}
            style={({ pressed }) => [styles.quickCell, pressed && styles.pressed]}>
            <Ionicons name="wallet-outline" size={22} color={colors.limeDark} />
            <Text style={styles.quickLabel}>Budgets</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/plan/loans')}
            style={({ pressed }) => [styles.quickCell, pressed && styles.pressed]}>
            <Ionicons name="card-outline" size={22} color={colors.limeDark} />
            <Text style={styles.quickLabel}>Crédits</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Charges à prévoir</Text>
        <Text style={styles.sectionSub}>
          Abonnements (échéance sous ~45 jours), récurrences et mensualités crédits — tri par date.
        </Text>

        {rows.length === 0 ? (
          <Text style={styles.empty}>
            Rien à afficher pour l’instant. Ajoutez des abonnements dans Plan ou des récurrences.
          </Text>
        ) : (
          <>
            <View style={styles.subSummary}>
              <Text style={styles.subSummaryText}>
                Total indicatif listé :{' '}
                <Text style={styles.subSummaryBold}>
                  {formatCurrency(recurringTotal)}
                </Text>
              </Text>
            </View>
            {rows.map((r) => (
              <View key={r.id} style={styles.row}>
                <View style={styles.rowIcon}>
                  <Ionicons name="calendar-outline" size={22} color={colors.accent} />
                </View>
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle} numberOfLines={2}>
                    {r.title}
                  </Text>
                  <Text style={styles.rowSub} numberOfLines={2}>
                    {r.subtitle}
                  </Text>
                </View>
                <Text style={styles.rowAmt}>{formatCurrency(r.amountDisplay)}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </UchumiScreen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: spacing.sm },
  scroll: { gap: spacing.sm },
  headerIconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    borderRadius: 22,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryTotal: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.sm,
    fontVariant: ['tabular-nums'],
  },
  summaryHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 18,
  },
  refLine: { fontSize: 12, color: colors.textSecondary, marginTop: spacing.md },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
    flexWrap: 'wrap',
  },
  quickTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  quickCell: {
    width: '48%',
    backgroundColor: colors.dune,
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    gap: 8,
    minHeight: 88,
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  sectionSub: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  subSummary: {
    backgroundColor: colors.marshland,
    borderRadius: 12,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  subSummaryText: { fontSize: 13, color: colors.textSecondary },
  subSummaryBold: { fontWeight: '800', color: colors.textPrimary },
  empty: { color: colors.textMuted, fontSize: 14, lineHeight: 21 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dune,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(168,153,104,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  rowSub: { fontSize: 12, color: colors.textMuted, marginTop: 4, lineHeight: 17 },
  rowAmt: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  pressed: { opacity: 0.9 },
});
