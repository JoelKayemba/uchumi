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

import { BubbleCard } from '@/src/components/dashboard/bubble-card';
import { DonutLegend, MonthDonut } from '@/src/components/dashboard/month-donut';
import { QuickActionTile } from '@/src/components/dashboard/quick-action-tile';
import { WeekBars } from '@/src/components/dashboard/week-bars';
import { UchumiScreen } from '@/src/components/uchumi-screen';
import { tipForDay } from '@/src/constants/financial-tips';
import { computeAvailable } from '@/src/domain/balance';
import { last7DaysBars } from '@/src/domain/dashboard-charts';
import { isDue } from '@/src/domain/recurring-due';
import {
  filterByPeriod,
  filterTransactionsToday,
  sumByKind,
} from '@/src/domain/stats';
import { useFormatCurrency } from '@/src/hooks/use-format-currency';
import { useAppStore } from '@/src/store/use-app-store';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

dayjs.locale('fr');

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const formatCurrency = useFormatCurrency();
  const appMode = useAppStore((s) => s.appMode);
  const transactions = useAppStore((s) => s.transactions);
  const reminderEnabled = useAppStore((s) => s.reminderEnabled);
  const reminderHour = useAppStore((s) => s.reminderHour);
  const reminderMinute = useAppStore((s) => s.reminderMinute);
  const lowBalanceEnabled = useAppStore((s) => s.lowBalanceEnabled);
  const lowBalanceThreshold = useAppStore((s) => s.lowBalanceThreshold);
  const streakCount = useAppStore((s) => s.streakCount);
  const savingsGoals = useAppStore((s) => s.savingsGoals);
  const recurringRules = useAppStore((s) => s.recurringRules);

  const available = computeAvailable(transactions);
  const hasMovements = transactions.length > 0;

  const todayTx = useMemo(
    () => filterTransactionsToday(transactions),
    [transactions]
  );
  const todayTotals = useMemo(() => sumByKind(todayTx), [todayTx]);
  const hasToday = todayTx.length > 0;
  const sortiesJour = todayTotals.expense + todayTotals.savings;

  const monthFiltered = useMemo(
    () => filterByPeriod(transactions, 'month'),
    [transactions]
  );
  const monthTotals = useMemo(() => sumByKind(monthFiltered), [monthFiltered]);
  const monthNet =
    monthTotals.income - monthTotals.expense - monthTotals.savings;

  const weekBars = useMemo(() => last7DaysBars(transactions), [transactions]);

  const greeting = useMemo(() => {
    const h = dayjs().hour();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }, []);

  const timeReminder = `${String(reminderHour).padStart(2, '0')}:${String(reminderMinute).padStart(2, '0')}`;

  const donutSegments = useMemo(
    () => [
      {
        value: monthTotals.income,
        color: colors.success,
        label: `Entrées ${formatCurrency(monthTotals.income)}`,
      },
      {
        value: monthTotals.expense,
        color: colors.danger,
        label: `Dépenses ${formatCurrency(monthTotals.expense)}`,
      },
      {
        value: monthTotals.savings,
        color: colors.accent,
        label: `Épargne ${formatCurrency(monthTotals.savings)}`,
      },
    ],
    [monthTotals, formatCurrency]
  );

  const tip = useMemo(() => tipForDay(), []);

  const dueRecurring = useMemo(
    () => recurringRules.filter((r) => isDue(r)),
    [recurringRules]
  );

  return (
    <UchumiScreen style={styles.outer}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + 88 },
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
          <View style={styles.modeBubble}>
            <Ionicons
              name={appMode === 'business' ? 'briefcase' : 'person'}
              size={16}
              color={colors.textPrimary}
            />
            <Text style={styles.modeBubbleText}>
              {appMode === 'business' ? 'Activité' : 'Perso'}
            </Text>
          </View>
        </View>

        <LinearGradient
          colors={['#3d4f5c', '#2a3038', '#1e2428']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="wallet" size={28} color={colors.textPrimary} />
            </View>
            <Text style={styles.heroLabel}>Portefeuille disponible</Text>
          </View>
          <Text style={styles.heroAmount}>
            {hasMovements ? formatCurrency(available) : '—'}
          </Text>
          <Text style={styles.heroHint}>
            {hasMovements
              ? 'Entrées − dépenses − épargne (devise d’affichage).'
              : 'Ajoutez un mouvement pour suivre votre solde.'}
          </Text>
        </LinearGradient>

        {!hasToday ? (
          <LinearGradient
            colors={['#a89968', '#6b5a7a', '#2f343c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dailyNudgeOuter}>
            <View style={styles.dailyNudgeInner}>
              <View style={styles.dailyNudgeHeaderRow}>
                <View style={styles.dailyNudgeBadge}>
                  <Text style={styles.dailyNudgeBadgeText}>À faire</Text>
                </View>
                <View style={styles.dailyNudgeIconWrap}>
                  <Ionicons name="create-outline" size={24} color={colors.textPrimary} />
                </View>
              </View>
              <Text style={styles.dailyNudgeTitle}>Aucune saisie aujourd’hui</Text>
              <Text style={styles.dailyNudgeSub}>
                {reminderEnabled
                  ? `Un rappel vous sera envoyé à ${timeReminder}. Vous pouvez aussi saisir tout de suite.`
                  : 'En quelques secondes, gardez une trace de vos entrées, sorties et épargne.'}
              </Text>
              <Pressable
                onPress={() => router.push('/transaction/new')}
                style={({ pressed }) => [
                  styles.dailyNudgeCta,
                  pressed && styles.pressed,
                ]}>
                <Text style={styles.dailyNudgeCtaText}>Enregistrer un mouvement</Text>
                <Ionicons name="arrow-forward" size={20} color="#1a1816" />
              </Pressable>
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.dailyDoneCard}>
            <View style={styles.dailyDoneRow}>
              <Ionicons name="checkmark-circle" size={28} color={colors.success} />
              <View style={styles.dailyDoneText}>
                <Text style={styles.dailyDoneTitle}>Journée à jour</Text>
                <Text style={styles.dailyDoneSub}>
                  {reminderEnabled
                    ? `Rappel quotidien à ${timeReminder} pour les prochains jours.`
                    : 'Activez les rappels dans Réglages pour ne pas oublier de saisir.'}
                </Text>
              </View>
            </View>
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

        {streakCount > 0 ? (
          <BubbleCard variant="accent">
            <View style={styles.streakRow}>
              <Ionicons name="flame" size={28} color={colors.accent} />
              <View style={styles.streakText}>
                <Text style={styles.streakTitle}>Série active</Text>
                <Text style={styles.streakSub}>
                  {streakCount} jour(s) d’affilée avec au moins un mouvement enregistré.
                </Text>
              </View>
            </View>
          </BubbleCard>
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

        {savingsGoals.length > 0 ? (
          <BubbleCard>
            <Text style={styles.cardSection}>Objectifs d’épargne</Text>
            {savingsGoals.slice(0, 3).map((g) => {
              const ratio =
                g.targetAmount > 0
                  ? Math.min(1, g.savedAmount / g.targetAmount)
                  : 0;
              return (
                <View key={g.id} style={styles.goalPreview}>
                  <Text style={styles.goalName} numberOfLines={1}>
                    {g.name}
                  </Text>
                  <Text style={styles.goalPct}>
                    {Math.round(ratio * 100)} % ·{' '}
                    {formatCurrency(g.savedAmount)} / {formatCurrency(g.targetAmount)}
                  </Text>
                </View>
              );
            })}
            <Pressable onPress={() => router.push('/plan/goals')}>
              <Text style={styles.linkMore}>Voir tout →</Text>
            </Pressable>
          </BubbleCard>
        ) : null}

        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.actionsGrid}>
          <QuickActionTile
            label="Nouveau mouvement"
            colorsGrad={['#4a6670', '#2f3d42']}
            icon={<Ionicons name="add-circle" size={26} color="#E8F4F8" />}
            onPress={() => router.push('/transaction/new')}
          />
          <QuickActionTile
            label="Historique"
            colorsGrad={['#5c4a6b', '#352a40']}
            icon={<Ionicons name="reorder-four" size={26} color="#F0E8F8" />}
            onPress={() => router.push('/transactions')}
          />
          <QuickActionTile
            label="Statistiques"
            colorsGrad={['#4a6b5a', '#263830']}
            icon={<Ionicons name="pie-chart" size={24} color="#E8F5EE" />}
            onPress={() => router.push('/stats')}
          />
          <QuickActionTile
            label="Plan & budgets"
            colorsGrad={['#6b5a4a', '#3d3228']}
            icon={<Ionicons name="folder-open" size={24} color="#FFF5E8" />}
            onPress={() => router.push('/plan/budgets')}
          />
        </View>

        {hasToday ? (
          <BubbleCard variant="accent">
            <Text style={styles.cardSection}>Aujourd’hui</Text>
            <View style={styles.todayGrid}>
              <View style={styles.todayBubble}>
                <Ionicons name="trending-up" size={20} color={colors.success} />
                <Text style={styles.todaySmall}>Entrées</Text>
                <Text style={[styles.todayAmt, { color: colors.success }]}>
                  +{formatCurrency(todayTotals.income)}
                </Text>
              </View>
              <View style={styles.todayBubble}>
                <Ionicons name="trending-down" size={20} color={colors.danger} />
                <Text style={styles.todaySmall}>Sorties</Text>
                <Text style={[styles.todayAmt, { color: colors.danger }]}>
                  −{formatCurrency(sortiesJour)}
                </Text>
              </View>
            </View>
          </BubbleCard>
        ) : null}

        <BubbleCard variant="deep">
          <Text style={styles.cardSection}>Ce mois — répartition</Text>
          {monthFiltered.length === 0 ? (
            <Text style={styles.muted}>Pas encore de données ce mois-ci.</Text>
          ) : (
            <View style={styles.donutRow}>
              <MonthDonut
                segments={donutSegments}
                centerLabel="Flux net"
                centerValue={formatCurrency(monthNet)}
              />
              <DonutLegend segments={donutSegments} />
            </View>
          )}
        </BubbleCard>

        <BubbleCard>
          <WeekBars bars={weekBars} title="Rythme sur 7 jours" />
        </BubbleCard>

        <BubbleCard variant="accent">
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={22} color={colors.accent} />
            <Text style={styles.tipTitle}>Conseil du jour</Text>
          </View>
          <Text style={styles.tipBody}>{tip}</Text>
        </BubbleCard>
      </ScrollView>
    </UchumiScreen>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    paddingTop: spacing.md,
  },
  container: {
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  headerText: {
    flex: 1,
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
  modeBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.dune,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modeBubbleText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  hero: {
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  heroAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  heroHint: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: 'rgba(244,241,238,0.65)',
    lineHeight: 18,
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
  dailyNudgeOuter: {
    borderRadius: 22,
    padding: 2,
  },
  dailyNudgeInner: {
    borderRadius: 20,
    backgroundColor: colors.dune,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  dailyNudgeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dailyNudgeBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(168,153,104,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(168,153,104,0.45)',
  },
  dailyNudgeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  dailyNudgeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dailyNudgeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.4,
    marginTop: spacing.xs,
  },
  dailyNudgeSub: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  dailyNudgeCta: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.textPrimary,
  },
  dailyNudgeCtaText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1816',
  },
  dailyDoneCard: {
    borderRadius: 20,
    padding: spacing.md,
    backgroundColor: colors.dune,
    borderWidth: 1,
    borderColor: 'rgba(122,158,122,0.35)',
  },
  dailyDoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dailyDoneText: {
    flex: 1,
  },
  dailyDoneTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  dailyDoneSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  streakText: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  streakSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
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
  goalPreview: {
    marginBottom: spacing.sm,
  },
  goalName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  goalPct: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  linkMore: {
    marginTop: spacing.sm,
    color: colors.accent,
    fontWeight: '700',
    fontSize: 14,
  },
  pressed: {
    opacity: 0.88,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.sm,
    letterSpacing: -0.3,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  cardSection: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  muted: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  todayGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  todayBubble: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 16,
    padding: spacing.md,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  todaySmall: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  todayAmt: {
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  tipBody: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
