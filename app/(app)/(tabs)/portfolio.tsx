import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { CurveType, LineChart } from 'react-native-gifted-charts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/src/components/screen-header';
import { UchumiScreen } from '@/src/components/uchumi-screen';
import { monthDailyOutflow } from '@/src/domain/portfolio-chart';
import { useFormatCurrency } from '@/src/hooks/use-format-currency';
import { formatCurrencyIso } from '@/src/lib/format-currency';
import { availableByIso, formatIsoTotals, sumByIso } from '@/src/lib/multi-currency';
import { useAppStore } from '@/src/store/use-app-store';
import { finShell } from '@/src/theme/fin-shell';
import { TAB_BAR_FLOAT_BOTTOM_OFFSET } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';
import type { Transaction } from '@/src/types/transaction';

function kindIcon(kind: Transaction['kind']) {
  switch (kind) {
    case 'income':
      return 'arrow-down-circle' as const;
    case 'expense':
      return 'arrow-up-circle' as const;
    default:
      return 'albums' as const;
  }
}

export default function PortfolioScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const formatCurrency = useFormatCurrency();
  const transactions = useAppStore((s) => s.transactions);
  const [query, setQuery] = useState('');

  const balanceByIso = useMemo(() => availableByIso(transactions), [transactions]);
  const balanceLabel = useMemo(() => formatIsoTotals(balanceByIso), [balanceByIso]);
  const daily = useMemo(() => monthDailyOutflow(transactions), [transactions]);
  const monthOutByIso = useMemo(
    () =>
      sumByIso(
        transactions.filter(
          (t) =>
            dayjs(t.createdAt).valueOf() >= dayjs().startOf('month').valueOf() &&
            (t.kind === 'expense' || t.kind === 'savings')
        )
      ),
    [transactions]
  );
  const monthOutLabel = useMemo(() => formatIsoTotals(monthOutByIso), [monthOutByIso]);

  const lineData = useMemo(
    () => daily.map((d) => ({ value: Math.round(d.value * 100) / 100 })),
    [daily]
  );

  const chartWidth = Math.max(200, width - spacing.md * 4);

  const monthTx = useMemo(() => {
    const start = dayjs().startOf('month').valueOf();
    return transactions
      .filter((t) => dayjs(t.createdAt).valueOf() >= start)
      .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
  }, [transactions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return monthTx.slice(0, 40);
    return monthTx.filter((t) => t.label.toLowerCase().includes(q)).slice(0, 40);
  }, [monthTx, query]);

  const periodLabel = dayjs().format('MMMM YYYY');

  return (
    <UchumiScreen style={styles.screen}>
      <ScreenHeader title="Portefeuille" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + TAB_BAR_FLOAT_BOTTOM_OFFSET },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <LinearHeroCard
          balanceLabel={balanceLabel}
          monthOutLabel={monthOutLabel}
          periodLabel={periodLabel}
        />

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Sorties du mois (dépenses + épargne)</Text>
          <Text style={styles.chartSub}>
            Courbe jour par jour — glissez pour explorer les points.
          </Text>
          {lineData.length > 0 ? (
            <LineChart
              data={lineData}
              width={chartWidth}
              height={200}
              curved
              areaChart
              curveType={CurveType.CUBIC}
              color={finShell.purple}
              thickness={3}
              startFillColor="rgba(138,112,245,0.35)"
              endFillColor="rgba(138,112,245,0.02)"
              startOpacity={0.9}
              endOpacity={0.05}
              hideDataPoints
              spacing={Math.max(
                6,
                (chartWidth - 40) / Math.max(lineData.length - 1, 1)
              )}
              initialSpacing={12}
              endSpacing={12}
              yAxisThickness={0}
              xAxisThickness={0}
              rulesType="solid"
              rulesColor={finShell.border}
              yAxisTextStyle={{ color: finShell.muted, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: finShell.muted, fontSize: 10 }}
              noOfSections={4}
              maxValue={
                Math.max(
                  ...lineData.map((d) => d.value),
                  1
                ) * 1.15
              }
              yAxisColor="transparent"
              xAxisColor="transparent"
              pointerConfig={{
                pointerStripColor: finShell.purple,
                pointerStripWidth: 1,
                pointerColor: finShell.purple,
                radius: 5,
                pointerLabelWidth: 96,
                pointerLabelHeight: 44,
                activatePointersOnLongPress: false,
                activatePointersInstantlyOnTouch: true,
                pointerLabelComponent: (items: { value: number }[]) => {
                  const v = items?.[0]?.value ?? 0;
                  return (
                    <View style={styles.tooltip}>
                      <Text style={styles.tooltipText}>{formatCurrency(v)}</Text>
                    </View>
                  );
                },
              }}
            />
          ) : (
            <Text style={styles.emptyChart}>Pas encore de données ce mois.</Text>
          )}
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={20} color={finShell.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un mouvement du mois…"
            placeholderTextColor={finShell.muted}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <Text style={styles.listTitle}>Mouvements récents</Text>
        {filtered.length === 0 ? (
          <Text style={styles.emptyList}>Aucun résultat.</Text>
        ) : (
          filtered.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => router.push(`/transaction/${t.id}`)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              <View style={[styles.rowIcon, { backgroundColor: finShell.barTrack }]}>
                <Ionicons
                  name={kindIcon(t.kind)}
                  size={22}
                  color={finShell.ink}
                />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {t.label}
                </Text>
                <Text style={styles.rowMeta} numberOfLines={1}>
                  {dayjs(t.createdAt).format('D MMM · HH:mm')}
                </Text>
              </View>
              <Text
                style={[
                  styles.rowAmt,
                  t.kind === 'income' ? styles.amtIn : styles.amtOut,
                ]}>
                {t.kind === 'income' ? '+' : '−'}
                {formatCurrencyIso(t.amount, t.isoCurrency)}
              </Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </UchumiScreen>
  );
}

function LinearHeroCard({
  balanceLabel,
  monthOutLabel,
  periodLabel,
}: {
  balanceLabel: string;
  monthOutLabel: string;
  periodLabel: string;
}) {
  return (
    <LinearGradient
      colors={['#16181D', '#232734']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}>
      <View style={styles.heroTop}>
        <View style={styles.heroChip}>
          <View style={styles.heroChipInner} />
        </View>
        <Text style={styles.heroPeriod}>{periodLabel}</Text>
      </View>
      <Text style={styles.heroLabel}>Solde disponible</Text>
      <Text style={styles.heroBalance}>{balanceLabel}</Text>
      <Text style={styles.heroHint}>
        Sorties du mois : {monthOutLabel}
      </Text>
      <View style={styles.heroBrand}>
        <Ionicons name="wallet" size={14} color="#D6DAE6" />
        <Text style={styles.heroBrandText}>UCHUMI CARD</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: finShell.page,
    paddingTop: spacing.sm,
  },
  scroll: {
    gap: spacing.md,
  },
  hero: {
    backgroundColor: '#1A1E29',
    borderRadius: 28,
    padding: spacing.lg,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  heroChip: {
    width: 44,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#D9BE79',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroChipInner: {
    width: 28,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.22)',
  },
  heroPeriod: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B8C0D4',
    textTransform: 'capitalize',
  },
  heroLabel: {
    fontSize: 13,
    color: '#A7AFC3',
    fontWeight: '600',
  },
  heroBalance: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginTop: 4,
  },
  heroHint: {
    marginTop: spacing.sm,
    fontSize: 14,
    color: '#C8D0E0',
    fontWeight: '600',
  },
  heroBrand: {
    marginTop: spacing.md,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.9,
  },
  heroBrandText: {
    color: '#D6DAE6',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  chartCard: {
    backgroundColor: finShell.card,
    borderRadius: 24,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: finShell.border,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: finShell.ink,
  },
  chartSub: {
    fontSize: 12,
    color: finShell.muted,
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  emptyChart: {
    color: finShell.muted,
    fontSize: 14,
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },
  tooltip: {
    backgroundColor: finShell.ink,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tooltipText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: finShell.barTrack,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: finShell.ink,
  },
  listTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: finShell.ink,
    marginTop: spacing.xs,
  },
  emptyList: {
    color: finShell.muted,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: finShell.card,
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: finShell.border,
  },
  pressed: { opacity: 0.92 },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1 },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: finShell.ink,
  },
  rowMeta: {
    fontSize: 12,
    color: finShell.muted,
    marginTop: 4,
  },
  rowAmt: {
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  amtIn: { color: finShell.green },
  amtOut: { color: finShell.ink },
});
