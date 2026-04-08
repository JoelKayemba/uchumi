import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DonutLegend, MonthDonut } from '@/src/components/dashboard/month-donut';
import { ScreenHeader } from '@/src/components/screen-header';
import { UchumiScreen } from '@/src/components/uchumi-screen';
import {
  filterTransactionsBetween,
  getLast7DaysWindow,
  totalOutflowDisplay,
} from '@/src/domain/home-insights';
import { sumByKind } from '@/src/domain/stats';
import { useFormatCurrency } from '@/src/hooks/use-format-currency';
import { useAppStore } from '@/src/store/use-app-store';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';
import type { Transaction } from '@/src/types/transaction';

dayjs.locale('fr');

function isOutflow(t: Transaction): boolean {
  return t.kind === 'expense' || t.kind === 'savings';
}

export default function PastExpensesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const formatCurrency = useFormatCurrency();
  const transactions = useAppStore((s) => s.transactions);
  const categories = useAppStore((s) => s.categories);

  const catName = (id: string | null) =>
    id ? categories.find((c) => c.id === id)?.name ?? '—' : 'Sans catégorie';

  const { window, list, totals, totalOut } = useMemo(() => {
    const w = getLast7DaysWindow();
    const raw = filterTransactionsBetween(transactions, w.start, w.end);
    const list = raw.filter(isOutflow).sort(
      (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
    );
    const k = sumByKind(list);
    return {
      window: w,
      list,
      totals: k,
      totalOut: totalOutflowDisplay(raw),
    };
  }, [transactions]);

  const periodLabel = `${window.start.format('D MMM')} – ${window.end.format('D MMMM YYYY')}`;

  const donutSegments = useMemo(
    () => [
      {
        value: totals.expense,
        color: colors.danger,
        label: `Dépenses ${formatCurrency(totals.expense)}`,
      },
      {
        value: totals.savings,
        color: colors.accent,
        label: `Épargne ${formatCurrency(totals.savings)}`,
      },
    ],
    [totals.expense, totals.savings, formatCurrency]
  );

  return (
    <UchumiScreen style={styles.wrap}>
      <ScreenHeader
        title="Dépenses passées"
        right={
          <Pressable
            onPress={() => router.push('/stats')}
            hitSlop={12}
            style={({ pressed }) => [styles.headerIconBtn, pressed && styles.pressed]}>
            <Ionicons name="bar-chart-outline" size={22} color={colors.textPrimary} />
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
          <Text style={styles.summaryLabel}>Période</Text>
          <Text style={styles.summaryPeriod}>{periodLabel}</Text>
          <Text style={styles.summaryTotal}>{formatCurrency(totalOut)}</Text>
          <Text style={styles.summaryHint}>
            Total sorties (dépenses + épargne), devise d’affichage
          </Text>
          <View style={styles.donutRow}>
            <MonthDonut
              segments={donutSegments}
              centerLabel="Sorties 7 j."
              centerValue={formatCurrency(totalOut)}
            />
            <DonutLegend segments={donutSegments} />
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryChip}>
              <Text style={styles.summaryChipLabel}>Dépenses</Text>
              <Text style={styles.summaryChipVal}>
                {formatCurrency(totals.expense)}
              </Text>
            </View>
            <View style={styles.summaryChip}>
              <Text style={styles.summaryChipLabel}>Épargne</Text>
              <Text style={styles.summaryChipVal}>
                {formatCurrency(totals.savings)}
              </Text>
            </View>
          </View>
          <Text style={styles.countLine}>
            {list.length} mouvement{list.length === 1 ? '' : 's'}
          </Text>
        </LinearGradient>

        <Text style={styles.quickTitle}>Raccourcis</Text>
        <View style={styles.quickGrid}>
          <Pressable
            onPress={() => router.push('/plan/budgets')}
            style={({ pressed }) => [styles.quickCell, pressed && styles.pressed]}>
            <Ionicons name="wallet-outline" size={22} color={colors.subscriptionPurple} />
            <Text style={styles.quickLabel}>Budgets</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/plan/subscriptions')}
            style={({ pressed }) => [styles.quickCell, pressed && styles.pressed]}>
            <Ionicons name="albums-outline" size={22} color={colors.subscriptionPurple} />
            <Text style={styles.quickLabel}>Abonnements</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/stats')}
            style={({ pressed }) => [styles.quickCell, pressed && styles.pressed]}>
            <Ionicons name="pie-chart-outline" size={22} color={colors.limeDark} />
            <Text style={styles.quickLabel}>Statistiques</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/transactions')}
            style={({ pressed }) => [styles.quickCell, pressed && styles.pressed]}>
            <Ionicons name="reorder-four-outline" size={22} color={colors.limeDark} />
            <Text style={styles.quickLabel}>Mouvements</Text>
          </Pressable>
        </View>

        <Text style={styles.listTitle}>Historique</Text>

        {list.length === 0 ? (
          <Text style={styles.empty}>
            Aucune sortie sur les 7 derniers jours.
          </Text>
        ) : (
          list.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => router.push(`/transaction/${t.id}`)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              <View
                style={[
                  styles.kindDot,
                  {
                    backgroundColor:
                      t.kind === 'expense' ? colors.danger : colors.accent,
                  },
                ]}
              />
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {t.label}
                </Text>
                <Text style={styles.rowMeta} numberOfLines={1}>
                  {dayjs(t.createdAt).format('dddd D MMMM · HH:mm')} ·{' '}
                  {catName(t.categoryId)}
                </Text>
                <Text style={styles.rowKind}>
                  {t.kind === 'expense' ? 'Dépense' : 'Épargne'}
                </Text>
              </View>
              <Text style={styles.rowAmt}>
                −{formatCurrency(t.amountInDisplayCurrency)}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))
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
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryPeriod: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  summaryTotal: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.sm,
    fontVariant: ['tabular-nums'],
  },
  summaryHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
    lineHeight: 17,
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.md,
    flexWrap: 'wrap',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  summaryChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  summaryChipLabel: { fontSize: 11, color: colors.textMuted },
  summaryChipVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
  },
  countLine: { fontSize: 12, color: colors.textMuted, marginTop: spacing.md },
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
  listTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
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
  pressed: { opacity: 0.9 },
  kindDot: {
    width: 8,
    height: 36,
    borderRadius: 4,
  },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  rowMeta: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  rowKind: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },
  rowAmt: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.danger,
    fontVariant: ['tabular-nums'],
  },
});
