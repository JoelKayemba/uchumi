import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { useMemo } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdBannerSlot } from '@/src/components/ad-banner-slot';
import { HomeHeroLime } from '@/src/components/dashboard/home-hero-lime';
import { SubscriptionCarousel } from '@/src/components/dashboard/subscription-carousel';
import { WeekBars } from '@/src/components/dashboard/week-bars';
import { UchumiScreen } from '@/src/components/uchumi-screen';
import { subscriptionAmountToDisplay } from '@/src/domain/subscription-amount';
import { last7DaysBars } from '@/src/domain/dashboard-charts';
import { isDue } from '@/src/domain/recurring-due';
import {
  filterByPeriod,
  filterTransactionsToday,
  sumByKind,
} from '@/src/domain/stats';
import { formatCurrencyIso } from '@/src/lib/format-currency';
import { availableByIso, formatIsoTotals, sumByIso } from '@/src/lib/multi-currency';
import { useFormatCurrency } from '@/src/hooks/use-format-currency';
import { useAppStore } from '@/src/store/use-app-store';
import { colors, TAB_BAR_FLOAT_BOTTOM_OFFSET } from '@/src/theme';
import { finShell } from '@/src/theme/fin-shell';
import { spacing } from '@/src/theme/spacing';
import type { Transaction } from '@/src/types/transaction';

dayjs.locale('fr');

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const formatCurrency = useFormatCurrency();
  const transactions = useAppStore((s) => s.transactions);
  const categories = useAppStore((s) => s.categories);
  const reminderEnabled = useAppStore((s) => s.reminderEnabled);
  const reminderHour = useAppStore((s) => s.reminderHour);
  const reminderMinute = useAppStore((s) => s.reminderMinute);
  const lowBalanceEnabled = useAppStore((s) => s.lowBalanceEnabled);
  const lowBalanceThreshold = useAppStore((s) => s.lowBalanceThreshold);
  const recurringRules = useAppStore((s) => s.recurringRules);
  const loans = useAppStore((s) => s.loans);
  const subscriptions = useAppStore((s) => s.subscriptions);
  const displayCurrency = useAppStore((s) => s.currency);

  const availablePerIso = useMemo(() => availableByIso(transactions), [transactions]);
  const availableLabel = useMemo(
    () => formatIsoTotals(availablePerIso),
    [availablePerIso]
  );
  const hasMovements = transactions.length > 0;

  const todayTx = useMemo(
    () => filterTransactionsToday(transactions),
    [transactions]
  );
  const hasToday = todayTx.length > 0;
  const sortiesJourByIso = useMemo(
    () => sumByIso(todayTx, ['expense', 'savings']),
    [todayTx]
  );
  const sortiesJourLabel = useMemo(
    () => formatIsoTotals(sortiesJourByIso),
    [sortiesJourByIso]
  );

  const monthFiltered = useMemo(
    () => filterByPeriod(transactions, 'month'),
    [transactions]
  );
  const monthTotals = useMemo(() => sumByKind(monthFiltered), [monthFiltered]);

  const budgetProgress =
    monthTotals.income > 0
      ? Math.min(
          1,
          (monthTotals.expense + monthTotals.savings) / monthTotals.income
        )
      : 0;

  const weekBars = useMemo(() => last7DaysBars(transactions), [transactions]);

  const greeting = useMemo(() => {
    const h = dayjs().hour();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }, []);

  const timeReminder = `${String(reminderHour).padStart(2, '0')}:${String(reminderMinute).padStart(2, '0')}`;

  const dueRecurring = useMemo(
    () => recurringRules.filter((r) => isDue(r)),
    [recurringRules]
  );

  const fixedMonthlyForecast = useMemo(() => {
    const subTotal = subscriptions
      .filter((s) => s.isActive && s.isMonthlyRecurring)
      .reduce(
        (a, s) =>
          a + subscriptionAmountToDisplay(s.amount, s.currencyId, displayCurrency),
        0
      );
    const loanTotal = loans.reduce((a, l) => a + l.monthlyPayment, 0);
    return subTotal + loanTotal;
  }, [subscriptions, loans, displayCurrency]);
  const dayProgress = hasToday ? Math.min(1, todayTx.length / 6) : 0;
  const fixedItemsCount = useMemo(
    () => subscriptions.filter((s) => s.isActive && s.isMonthlyRecurring).length + loans.length,
    [subscriptions, loans]
  );
  const fixedProgress = Math.min(1, fixedItemsCount / 8);

  const recent = useMemo(() => {
    return [...transactions]
      .sort(
        (a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
      )
      .slice(0, 5);
  }, [transactions]);

  const catName = (id: string | null) =>
    id ? categories.find((c) => c.id === id)?.name ?? '—' : 'Sans catégorie';

  const amountColor = (t: Transaction) => {
    if (t.kind === 'income') return colors.success;
    if (t.kind === 'expense') return colors.danger;
    return colors.accent;
  };

  return (
    <UchumiScreen style={styles.outer}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + TAB_BAR_FLOAT_BOTTOM_OFFSET },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.dateLine}>
              {dayjs().format('dddd D MMMM')}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push('/transactions')}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
              hitSlop={8}>
              <Ionicons name="calendar-outline" size={22} color={colors.textPrimary} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/notifications')}
              style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
              hitSlop={8}
              accessibilityLabel="Notifications">
              <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
            </Pressable>
          </View>
        </View>

        <HomeHeroLime
          budgetProgress={budgetProgress}
          balanceLabel={hasMovements ? availableLabel : '—'}
          onPressAdd={() => router.push('/transaction/new')}
        />

        <AdBannerSlot compactTop />

        <View style={styles.miniRow}>
          <View style={styles.miniCard}>
            <View style={styles.miniTop}>
              <Text style={styles.miniLabel}>Dépenses du jour</Text>
              <ProgressRing progress={dayProgress} color={colors.accent} />
            </View>
            <Text style={styles.miniValue}>{hasToday ? sortiesJourLabel : '—'}</Text>
            <Text style={styles.miniHint}>Sorties + épargne enregistrées</Text>
          </View>
          <Pressable
            onPress={() => router.push('/plan/subscriptions')}
            style={({ pressed }) => [styles.miniCard, pressed && styles.pressed]}>
            <View style={styles.miniTop}>
              <Text style={styles.miniLabel}>Charges fixes</Text>
              <ProgressRing progress={fixedProgress} color={colors.subscriptionPurple} />
            </View>
            <Text style={[styles.miniValue, { color: colors.subscriptionPurple }]}>
              {formatCurrency(fixedMonthlyForecast)}
            </Text>
            <Text style={styles.miniHint}>Abonnements + crédits / mois</Text>
          </Pressable>
        </View>

        <SubscriptionCarousel
          subscriptions={subscriptions}
          onPressSubscription={() => router.push('/plan/subscriptions')}
          onPressSeeAll={() => router.push('/plan/subscriptions')}
        />

        <View style={styles.chartCard}>
          <WeekBars
            bars={weekBars}
            title="Cette semaine"
            variant="home"
          />
        </View>

        <View style={styles.insightsRow}>
          <Pressable
            onPress={() => router.push('/insights/past-expenses')}
            style={({ pressed }) => [styles.insightChip, pressed && styles.pressed]}>
            <Ionicons name="time-outline" size={18} color={colors.subscriptionPurple} />
            <Text style={styles.insightChipText}>Dépenses passées</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/insights/upcoming-expenses')}
            style={({ pressed }) => [styles.insightChip, pressed && styles.pressed]}>
            <Ionicons name="arrow-forward-circle-outline" size={18} color={colors.limeDark} />
            <Text style={styles.insightChipText}>À venir</Text>
          </Pressable>
        </View>

        {!hasToday ? (
          <View style={styles.dailyNudgeCard}>
            <Text style={styles.dailyNudgeTitle}>Aucune saisie aujourd’hui</Text>
            <Text style={styles.dailyNudgeSub}>
              {reminderEnabled
                ? `Rappel à ${timeReminder}. Vous pouvez aussi saisir tout de suite.`
                : 'En quelques secondes, tracez vos entrées et sorties.'}
            </Text>
            <Pressable
              onPress={() => router.push('/transaction/new')}
              style={({ pressed }) => [
                styles.dailyNudgeCta,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.dailyNudgeCtaText}>Enregistrer un mouvement</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        ) : (
          <View style={styles.dailyDoneCard}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            <Text style={styles.dailyDoneTitle}>Journée à jour</Text>
          </View>
        )}

        {lowBalanceEnabled && lowBalanceThreshold != null && lowBalanceThreshold > 0 ? (
          <View style={styles.reminderStrip}>
            <Ionicons name="shield-checkmark" size={18} color={colors.success} />
            <Text style={styles.reminderText}>
              Alerte fond faible sous {formatCurrency(lowBalanceThreshold)}.
            </Text>
          </View>
        ) : null}

        {dueRecurring.length > 0 ? (
          <Pressable
            onPress={() => router.push('/plan/recurring')}
            style={({ pressed }) => [styles.dueStrip, pressed && styles.pressed]}>
            <Ionicons name="repeat" size={20} color={colors.success} />
            <Text style={styles.reminderText}>
              {dueRecurring.length} récurrence(s) à valider — toucher pour ouvrir.
            </Text>
          </Pressable>
        ) : null}

        <Text style={styles.sectionTitle}>Mouvements récents</Text>
        {recent.length === 0 ? (
          <Text style={styles.muted}>Aucun mouvement pour l’instant.</Text>
        ) : (
          recent.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => router.push(`/transaction/${t.id}`)}
              style={({ pressed }) => [styles.txRow, pressed && styles.pressed]}>
              <View
                style={[
                  styles.txDot,
                  {
                    backgroundColor:
                      t.kind === 'income'
                        ? colors.success
                        : t.kind === 'expense'
                          ? colors.danger
                          : colors.accent,
                  },
                ]}
              />
              <View style={styles.txBody}>
                <Text style={styles.txTitle} numberOfLines={1}>
                  {t.label}
                </Text>
                <Text style={styles.txMeta} numberOfLines={1}>
                  {dayjs(t.createdAt).format('D MMM · HH:mm')} · {catName(t.categoryId)}
                </Text>
              </View>
              <Text style={[styles.txAmt, { color: amountColor(t) }]}>
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

function ProgressRing({ progress, color }: { progress: number; color: string }) {
  const size = 38;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));
  const dash = c * p;
  return (
    <View style={styles.ringWrap}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.fuscousGray}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={styles.ringPct}>{Math.round(p * 100)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    paddingTop: spacing.md,
    backgroundColor: finShell.page,
  },
  container: {
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.dune,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  dateLine: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  miniRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  miniCard: {
    flex: 1,
    backgroundColor: colors.dune,
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  miniTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  miniLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  miniValue: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  miniHint: {
    marginTop: 4,
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
  },
  ringWrap: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPct: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  chartCard: {
    backgroundColor: colors.dune,
    borderRadius: 22,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  insightsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  insightChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.dune,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  insightChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dailyNudgeCard: {
    borderRadius: 20,
    backgroundColor: colors.dune,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  dailyNudgeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  dailyNudgeSub: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  dailyNudgeCta: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.ink,
  },
  dailyNudgeCtaText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dailyDoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: 16,
    padding: spacing.md,
    backgroundColor: colors.limeMuted,
    borderWidth: 1,
    borderColor: 'rgba(179,230,122,0.6)',
  },
  dailyDoneTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  reminderStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.dune,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  reminderText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  dueStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.dune,
    borderWidth: 1,
    borderColor: colors.success,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  muted: {
    fontSize: 14,
    color: colors.textMuted,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dune,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  txDot: {
    width: 10,
    height: 40,
    borderRadius: 5,
  },
  txBody: {
    flex: 1,
    minWidth: 0,
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  txMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  txAmt: {
    fontSize: 15,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  pressed: {
    opacity: 0.88,
  },
});
