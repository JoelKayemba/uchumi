import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BubbleCard } from '@/src/components/dashboard/bubble-card';
import { UchumiScreen } from '@/src/components/uchumi-screen';
import { compareLastTwoMonths } from '@/src/domain/month-compare';
import {
  aggregateOutflowByCategory,
  filterByPeriod,
  type StatsPeriod,
  sumByKind,
} from '@/src/domain/stats';
import { useFormatCurrency } from '@/src/hooks/use-format-currency';
import { useAppStore } from '@/src/store/use-app-store';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

const PERIODS: { key: StatsPeriod; label: string }[] = [
  { key: 'week', label: 'Semaine' },
  { key: 'month', label: 'Mois' },
  { key: 'all', label: 'Tout' },
];

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const formatCurrency = useFormatCurrency();
  const [period, setPeriod] = useState<StatsPeriod>('month');
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
  const maxOut = useMemo(
    () => Math.max(...byCategory.map((r) => r.total), 1),
    [byCategory]
  );

  const monthCompare = useMemo(
    () => compareLastTwoMonths(transactions),
    [transactions]
  );

  const hasAny = filtered.length > 0;
  const netDelta =
    monthCompare.netCurrent - monthCompare.netPrevious;

  return (
    <UchumiScreen style={styles.wrap}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 88 },
        ]}
        showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#3a3540', '#252228']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="analytics" size={26} color={colors.textPrimary} />
          </View>
          <Text style={styles.title}>Statistiques</Text>
          <Text style={styles.subtitle}>
            Synthèse des flux et répartition par catégorie.
          </Text>
        </LinearGradient>

        <View style={styles.periodRow}>
          {PERIODS.map(({ key, label }) => (
            <Pressable
              key={key}
              onPress={() => setPeriod(key)}
              style={[
                styles.periodChip,
                period === key && styles.periodChipActive,
              ]}>
              <Text
                style={[
                  styles.periodText,
                  period === key && styles.periodTextActive,
                ]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>

        {transactions.length > 0 ? (
          <BubbleCard variant="deep">
            <Text style={styles.section}>Ce mois vs mois dernier</Text>
            <Text style={styles.compareHint}>
              Comparaison sur les mois civils complets (tous vos mouvements).
            </Text>
            <View style={styles.compareGrid}>
              <View style={styles.compareCell}>
                <Text style={styles.compareLabel}>Solde net (ce mois)</Text>
                <Text
                  style={[
                    styles.compareValue,
                    monthCompare.netCurrent >= 0
                      ? styles.positive
                      : styles.negative,
                  ]}>
                  {monthCompare.netCurrent >= 0 ? '+' : '−'}
                  {formatCurrency(Math.abs(monthCompare.netCurrent))}
                </Text>
              </View>
              <View style={styles.compareCell}>
                <Text style={styles.compareLabel}>Solde net (mois dernier)</Text>
                <Text
                  style={[
                    styles.compareValue,
                    monthCompare.netPrevious >= 0
                      ? styles.positive
                      : styles.negative,
                  ]}>
                  {monthCompare.netPrevious >= 0 ? '+' : '−'}
                  {formatCurrency(Math.abs(monthCompare.netPrevious))}
                </Text>
              </View>
            </View>
            <View style={styles.compareDeltaRow}>
              <Ionicons
                name={netDelta >= 0 ? 'trending-up' : 'trending-down'}
                size={20}
                color={netDelta >= 0 ? colors.success : colors.danger}
              />
              <Text style={styles.compareDeltaText}>
                {netDelta >= 0 ? '+' : '−'}
                {formatCurrency(Math.abs(netDelta))} par rapport au mois précédent
              </Text>
            </View>
          </BubbleCard>
        ) : null}

        {!hasAny ? (
          <BubbleCard>
            <Text style={styles.empty}>
              Aucun mouvement sur cette période. Enregistrez des entrées ou des
              dépenses depuis l’onglet Mouvements.
            </Text>
          </BubbleCard>
        ) : (
          <>
            <BubbleCard variant="accent">
              <Text style={styles.section}>Totaux sur la période</Text>
              <View style={styles.totalsInner}>
                <View style={styles.totalBubble}>
                  <Ionicons name="arrow-up-circle" size={22} color={colors.success} />
                  <Text style={styles.totalLabel}>Entrées</Text>
                  <Text style={[styles.totalValue, styles.positive]}>
                    +{formatCurrency(totals.income)}
                  </Text>
                </View>
                <View style={styles.totalBubble}>
                  <Ionicons name="arrow-down-circle" size={22} color={colors.danger} />
                  <Text style={styles.totalLabel}>Dépenses</Text>
                  <Text style={[styles.totalValue, styles.negative]}>
                    −{formatCurrency(totals.expense)}
                  </Text>
                </View>
                <View style={styles.totalBubble}>
                  <Ionicons name="albums" size={20} color={colors.accent} />
                  <Text style={styles.totalLabel}>Épargne</Text>
                  <Text style={[styles.totalValue, styles.negative]}>
                    −{formatCurrency(totals.savings)}
                  </Text>
                </View>
              </View>
            </BubbleCard>

            <BubbleCard variant="deep">
              <Text style={styles.section}>Dépenses + épargne par catégorie</Text>
              {byCategory.length === 0 ? (
                <Text style={styles.emptyHint}>
                  Aucune sortie catégorisée sur cette période.
                </Text>
              ) : (
                <View style={styles.catBlock}>
                  {byCategory.map((row) => (
                    <View key={String(row.categoryId)} style={styles.catRow}>
                      <View style={styles.catHeader}>
                        <View
                          style={[styles.dot, { backgroundColor: row.color }]}
                        />
                        <Text style={styles.catName} numberOfLines={1}>
                          {row.name}
                        </Text>
                        <Text style={styles.catAmount}>
                          {formatCurrency(row.total)}
                        </Text>
                      </View>
                      <View style={styles.barTrack}>
                        <View
                          style={[
                            styles.barFill,
                            {
                              width: `${(row.total / maxOut) * 100}%`,
                              backgroundColor: row.color,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </BubbleCard>
          </>
        )}
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
    gap: spacing.md,
  },
  hero: {
    borderRadius: 22,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: spacing.xs,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(244,241,238,0.65)',
    marginTop: 6,
    lineHeight: 20,
  },
  periodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  periodChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.dune,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  periodChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.fuscousGray,
  },
  periodText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 14,
  },
  periodTextActive: {
    color: colors.textPrimary,
  },
  compareHint: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  compareGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  compareCell: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  compareLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 6,
  },
  compareValue: {
    fontSize: 17,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  compareDeltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  compareDeltaText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  section: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: spacing.md,
  },
  totalsInner: {
    gap: spacing.sm,
  },
  totalBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  totalLabel: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  positive: {
    color: colors.success,
  },
  negative: {
    color: colors.danger,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  emptyHint: {
    color: colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },
  catBlock: {
    gap: spacing.md,
  },
  catRow: {
    gap: spacing.xs,
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catName: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  catAmount: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.marshland,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    opacity: 0.88,
  },
});
