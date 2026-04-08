import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/src/components/screen-header';
import { UchumiScreen } from '@/src/components/uchumi-screen';
import { compareLastTwoMonths } from '@/src/domain/month-compare';
import {
  aggregateOutflowByCategory,
  filterByPeriod,
  type StatsPeriod,
  sumByKind,
} from '@/src/domain/stats';
import { formatCurrencyIso } from '@/src/lib/format-currency';
import { availableByIso } from '@/src/lib/multi-currency';
import { useFormatCurrency } from '@/src/hooks/use-format-currency';
import { useAppStore } from '@/src/store/use-app-store';
import { finShell } from '@/src/theme/fin-shell';
import { TAB_BAR_FLOAT_BOTTOM_OFFSET } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

const PERIODS: { key: StatsPeriod; label: string }[] = [
  { key: 'week', label: 'Semaine' },
  { key: 'month', label: 'Mois' },
  { key: 'all', label: 'Tout' },
];

const VIVA = [
  finShell.purple,
  finShell.blue,
  finShell.green,
  finShell.orange,
];

function signedLabelByIso(map: Map<string, number>): string {
  const entries = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  if (entries.length === 0) return '—';
  return entries
    .map(([iso, value]) => `${value >= 0 ? '+' : '−'}${formatCurrencyIso(Math.abs(value), iso)}`)
    .join(' · ');
}

function subtractIsoMaps(a: Map<string, number>, b: Map<string, number>): Map<string, number> {
  const out = new Map<string, number>();
  for (const [iso, v] of a) out.set(iso, v);
  for (const [iso, v] of b) out.set(iso, (out.get(iso) ?? 0) - v);
  return out;
}

export default function StatsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const formatCurrency = useFormatCurrency();
  const [period, setPeriod] = useState<StatsPeriod>('month');
  const [search, setSearch] = useState('');
  const transactions = useAppStore((s) => s.transactions);
  const categories = useAppStore((s) => s.categories);

  const filtered = useMemo(
    () => filterByPeriod(transactions, period),
    [transactions, period]
  );
  const totals = useMemo(() => sumByKind(filtered), [filtered]);
  const byCategory = useMemo(
    () => aggregateOutflowByCategory(filtered, categories),
    [filtered, categories]
  );
  const totalOut = totals.expense + totals.savings;

  const monthCompare = useMemo(
    () => compareLastTwoMonths(transactions),
    [transactions]
  );
  const netDelta = monthCompare.netCurrent - monthCompare.netPrevious;
  const monthCurrentTx = useMemo(() => {
    const start = dayjs().startOf('month').valueOf();
    const end = dayjs().endOf('month').valueOf();
    return transactions.filter((t) => {
      const v = dayjs(t.createdAt).valueOf();
      return v >= start && v <= end;
    });
  }, [transactions]);
  const monthPreviousTx = useMemo(() => {
    const start = dayjs().subtract(1, 'month').startOf('month').valueOf();
    const end = dayjs().subtract(1, 'month').endOf('month').valueOf();
    return transactions.filter((t) => {
      const v = dayjs(t.createdAt).valueOf();
      return v >= start && v <= end;
    });
  }, [transactions]);
  const netCurrentByIso = useMemo(() => availableByIso(monthCurrentTx), [monthCurrentTx]);
  const netPreviousByIso = useMemo(() => availableByIso(monthPreviousTx), [monthPreviousTx]);
  const netDeltaByIso = useMemo(
    () => subtractIsoMaps(netCurrentByIso, netPreviousByIso),
    [netCurrentByIso, netPreviousByIso]
  );
  const netCurrentLabel = useMemo(
    () => signedLabelByIso(netCurrentByIso),
    [netCurrentByIso]
  );
  const netPreviousLabel = useMemo(
    () => signedLabelByIso(netPreviousByIso),
    [netPreviousByIso]
  );
  const netDeltaLabel = useMemo(() => signedLabelByIso(netDeltaByIso), [netDeltaByIso]);

  const top4 = useMemo(() => {
    const sorted = [...byCategory].sort((a, b) => b.total - a.total);
    return sorted.slice(0, 4);
  }, [byCategory]);

  const barFlex = useMemo(() => {
    const sum = top4.reduce((a, r) => a + r.total, 0) || 1;
    return top4.map((r) => ({ ...r, flex: r.total / sum }));
  }, [top4]);

  const hasAny = filtered.length > 0;

  const listPreview = useMemo(() => {
    const out = filtered
      .filter((t) => t.kind === 'expense' || t.kind === 'savings')
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    const q = search.trim().toLowerCase();
    const sliced = q
      ? out.filter((t) => t.label.toLowerCase().includes(q))
      : out;
    return sliced.slice(0, 12);
  }, [filtered, search]);

  return (
    <UchumiScreen style={styles.screen}>
      <ScreenHeader title="Analyse des dépenses" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + TAB_BAR_FLOAT_BOTTOM_OFFSET },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryLabel}>Total sorties</Text>
              <Text style={styles.summaryTotal}>
                {hasAny ? formatCurrency(totalOut) : '—'}
              </Text>
              <Text style={styles.summaryHint}>
                Dépenses + épargne sur la période sélectionnée.
              </Text>
            </View>
            <View style={styles.pieBadge}>
              <Ionicons name="pie-chart" size={26} color={finShell.purple} />
            </View>
          </View>

          <View style={styles.periodRow}>
            {PERIODS.map(({ key, label }) => {
              const on = period === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setPeriod(key)}
                  style={[styles.periodChip, on && styles.periodChipOn]}>
                  <Text style={[styles.periodText, on && styles.periodTextOn]}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {top4.length > 0 ? (
            <View style={styles.segmentBar}>
              {barFlex.map((row, i) => (
                <View
                  key={String(row.categoryId)}
                  style={[
                    styles.segment,
                    {
                      flex: row.flex,
                      backgroundColor: VIVA[i % VIVA.length],
                    },
                  ]}
                />
              ))}
            </View>
          ) : null}
        </View>

        {transactions.length > 0 ? (
          <View style={styles.compareCard}>
            <Text style={styles.compareTitle}>Ce mois vs mois dernier</Text>
            <View style={styles.compareGrid}>
              <View style={styles.compareCell}>
                <Text style={styles.compareLabel}>Solde net (ce mois)</Text>
                <Text
                  style={[
                    styles.compareValue,
                    monthCompare.netCurrent >= 0 ? styles.pos : styles.neg,
                  ]}>
                  {netCurrentLabel}
                </Text>
              </View>
              <View style={styles.compareCell}>
                <Text style={styles.compareLabel}>Solde net (mois dernier)</Text>
                <Text
                  style={[
                    styles.compareValue,
                    monthCompare.netPrevious >= 0 ? styles.pos : styles.neg,
                  ]}>
                  {netPreviousLabel}
                </Text>
              </View>
            </View>
            <View style={styles.deltaRow}>
              <Ionicons
                name={netDelta >= 0 ? 'trending-up' : 'trending-down'}
                size={18}
                color={netDelta >= 0 ? finShell.green : finShell.orange}
              />
              <Text style={styles.deltaText}>
                {netDeltaLabel} vs mois précédent
              </Text>
            </View>
          </View>
        ) : null}

        <Text style={styles.blockTitle}>Par catégorie</Text>
        <View style={styles.catGrid}>
          {(byCategory.length ? byCategory.slice(0, 4) : []).map((row, i) => (
            <View
              key={String(row.categoryId)}
              style={[
                styles.catCard,
                { borderColor: (row.color || VIVA[i % VIVA.length]) + '55' },
              ]}>
              <View
                style={[
                  styles.catDot,
                  { backgroundColor: row.color || VIVA[i % VIVA.length] },
                ]}
              />
              <Text style={styles.catName} numberOfLines={2}>
                {row.name}
              </Text>
              <Text style={styles.catAmt}>{formatCurrency(row.total)}</Text>
            </View>
          ))}
          {byCategory.length === 0 ? (
            <Text style={styles.emptyHint}>
              Aucune sortie sur cette période.
            </Text>
          ) : null}
        </View>

        <View style={styles.insight}>
          <Ionicons name="pricetag-outline" size={22} color={finShell.orange} />
          <Text style={styles.insightText}>
            Astuce : classez vos mouvements pour affiner les prévisions et
            l’historique par catégorie.
          </Text>
          <Pressable onPress={() => router.push('/categories')}>
            <Text style={styles.insightLink}>Catégories ›</Text>
          </Pressable>
        </View>

        <Text style={styles.blockTitle}>Flux sur la période</Text>
        <View style={styles.totalsRow}>
          <View style={styles.tCell}>
            <Text style={styles.tLabel}>Entrées</Text>
            <Text style={[styles.tVal, styles.pos]}>+{formatCurrency(totals.income)}</Text>
          </View>
          <View style={styles.tCell}>
            <Text style={styles.tLabel}>Dépenses</Text>
            <Text style={[styles.tVal, styles.neg]}>−{formatCurrency(totals.expense)}</Text>
          </View>
          <View style={styles.tCell}>
            <Text style={styles.tLabel}>Épargne</Text>
            <Text style={[styles.tVal, styles.neg]}>−{formatCurrency(totals.savings)}</Text>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={20} color={finShell.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Filtrer les mouvements récents…"
            placeholderTextColor={finShell.muted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {listPreview.map((t) => (
          <Pressable
            key={t.id}
            onPress={() => router.push(`/transaction/${t.id}`)}
            style={({ pressed }) => [styles.txRow, pressed && styles.pressed]}>
            <View style={styles.txIcon}>
              <Ionicons
                name={t.kind === 'savings' ? 'albums-outline' : 'cart-outline'}
                size={20}
                color={finShell.ink}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.txTitle} numberOfLines={1}>
                {t.label}
              </Text>
              <Text style={styles.txSub} numberOfLines={1}>
                {t.kind === 'expense' ? 'Dépense' : 'Épargne'}
              </Text>
            </View>
            <Text style={styles.txAmt}>
              −{formatCurrency(t.amountInDisplayCurrency)}
            </Text>
          </Pressable>
        ))}

        <Pressable
          onPress={() => router.push('/insights/past-expenses')}
          style={({ pressed }) => [styles.moreLink, pressed && styles.pressed]}>
          <Text style={styles.moreLinkText}>Voir les insights 7 jours ›</Text>
        </Pressable>
      </ScrollView>
    </UchumiScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: finShell.page,
    paddingTop: spacing.sm,
  },
  scroll: { gap: spacing.md },
  summaryCard: {
    backgroundColor: finShell.card,
    borderRadius: 28,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: finShell.border,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: finShell.muted,
  },
  summaryTotal: {
    fontSize: 32,
    fontWeight: '800',
    color: finShell.ink,
    letterSpacing: -0.8,
    marginTop: 4,
  },
  summaryHint: {
    fontSize: 12,
    color: finShell.sub,
    marginTop: 6,
    lineHeight: 17,
  },
  pieBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(138,112,245,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  periodChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: finShell.barTrack,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  periodChipOn: {
    backgroundColor: finShell.ink,
    borderColor: finShell.ink,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '700',
    color: finShell.sub,
  },
  periodTextOn: {
    color: '#FFFFFF',
  },
  segmentBar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: spacing.lg,
    backgroundColor: finShell.barTrack,
  },
  segment: {
    height: '100%',
  },
  compareCard: {
    backgroundColor: finShell.card,
    borderRadius: 22,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: finShell.border,
    gap: spacing.sm,
  },
  compareTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: finShell.ink,
  },
  compareGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  compareCell: {
    flex: 1,
    backgroundColor: finShell.barTrack,
    borderRadius: 14,
    padding: spacing.md,
  },
  compareLabel: {
    fontSize: 11,
    color: finShell.muted,
    fontWeight: '600',
  },
  compareValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 6,
    fontVariant: ['tabular-nums'],
  },
  pos: { color: finShell.green },
  neg: { color: finShell.orange },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: spacing.xs,
  },
  deltaText: {
    fontSize: 13,
    fontWeight: '600',
    color: finShell.sub,
    flex: 1,
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: finShell.ink,
    marginTop: spacing.xs,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  catCard: {
    width: '48%',
    backgroundColor: finShell.card,
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    gap: 8,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catName: {
    fontSize: 14,
    fontWeight: '700',
    color: finShell.ink,
    minHeight: 36,
  },
  catAmt: {
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    color: finShell.ink,
  },
  emptyHint: {
    width: '100%',
    color: finShell.muted,
    fontSize: 14,
    fontStyle: 'italic',
  },
  insight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: finShell.insightBg,
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: finShell.insightBorder,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: finShell.sub,
    fontWeight: '600',
  },
  insightLink: {
    fontSize: 13,
    fontWeight: '800',
    color: finShell.ink,
  },
  totalsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tCell: {
    flex: 1,
    backgroundColor: finShell.card,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: finShell.border,
  },
  tLabel: {
    fontSize: 11,
    color: finShell.muted,
    fontWeight: '700',
  },
  tVal: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 6,
    fontVariant: ['tabular-nums'],
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: finShell.barTrack,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: finShell.ink,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 18,
    backgroundColor: finShell.card,
    borderWidth: 1,
    borderColor: finShell.border,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: finShell.barTrack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: finShell.ink,
  },
  txSub: {
    fontSize: 12,
    color: finShell.muted,
    marginTop: 2,
  },
  txAmt: {
    fontSize: 15,
    fontWeight: '800',
    color: finShell.ink,
    fontVariant: ['tabular-nums'],
  },
  moreLink: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
  },
  moreLinkText: {
    fontSize: 15,
    fontWeight: '800',
    color: finShell.purple,
  },
  pressed: { opacity: 0.92 },
});
