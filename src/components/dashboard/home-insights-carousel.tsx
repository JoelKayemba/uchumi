import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  compareWeekTrend,
  filterTransactionsBetween,
  getLast7DaysWindow,
  getPrevious7DaysWindow,
  suggestNextWeekCeiling,
  totalOutflowDisplay,
} from '@/src/domain/home-insights';
import type { Transaction } from '@/src/types/transaction';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

const W = Dimensions.get('window').width;
const CARD_W = Math.min(300, W * 0.82);
const GAP = spacing.sm;

type Props = {
  transactions: Transaction[];
  formatCurrency: (n: number) => string;
};

export function HomeInsightsCarousel({ transactions, formatCurrency }: Props) {
  const router = useRouter();

  const { last7Out, trend, suggestion } = useMemo(() => {
    const w1 = getLast7DaysWindow();
    const w2 = getPrevious7DaysWindow();
    const tx1 = filterTransactionsBetween(transactions, w1.start, w1.end);
    const tx2 = filterTransactionsBetween(transactions, w2.start, w2.end);
    const last7Out = totalOutflowDisplay(tx1);
    const prev7Out = totalOutflowDisplay(tx2);
    const trend = compareWeekTrend(last7Out, prev7Out);
    const suggestion = suggestNextWeekCeiling(last7Out);
    return {
      last7Out,
      trend,
      suggestion,
    };
  }, [transactions]);

  const trendLabel = useMemo(() => {
    if (trend.direction === 'unknown') return 'Pas assez d’historique pour comparer.';
    if (trend.direction === 'flat') return 'Stable vs la période précédente.';
    if (trend.percentChange == null) {
      return trend.direction === 'up'
        ? 'Hausse vs les 7 jours précédents.'
        : 'Baisse vs les 7 jours précédents.';
    }
    const sign = trend.percentChange > 0 ? '+' : '';
    return `${sign}${trend.percentChange} % vs les 7 jours précédents.`;
  }, [trend]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Vue d’ensemble</Text>
      <Text style={styles.sectionSub}>
        Touchez une carte pour le détail (7 derniers jours · charges à venir)
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={CARD_W + GAP}
        snapToAlignment="start"
        contentContainerStyle={styles.hScroll}>
        <Pressable
          onPress={() => router.push('/insights/past-expenses')}
          style={({ pressed }) => [styles.card, { width: CARD_W }, pressed && styles.pressed]}>
          <LinearGradient
            colors={['#FFFFFF', '#F7F7FA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardInner}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBubble}>
                <Ionicons name="analytics" size={22} color={colors.ink} />
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>7 jours</Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>Dépenses passées</Text>
            <Text style={styles.cardAmount}>
              {transactions.length === 0
                ? '—'
                : formatCurrency(last7Out)}
            </Text>
            <Text style={styles.cardHint}>
              Sorties + épargne (devise d’affichage), 7 derniers jours.
            </Text>
            <Text
              style={[
                styles.cardTrend,
                trend.direction === 'up' && { color: colors.danger },
                trend.direction === 'down' && { color: colors.success },
              ]}>
              {trendLabel}
            </Text>
            <View style={styles.tapHint}>
              <Text style={styles.tapHintText}>Voir le détail</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.accent} />
            </View>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={() => router.push('/insights/upcoming-expenses')}
          style={({ pressed }) => [styles.card, { width: CARD_W }, pressed && styles.pressed]}>
          <LinearGradient
            colors={['#FFFFFF', '#F0FDF4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardInner}>
            <View style={styles.cardHeader}>
              <View style={styles.iconBubble}>
                <Ionicons name="calendar" size={22} color={colors.ink} />
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>À venir</Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>Dépenses à venir</Text>
            <Text style={styles.cardAmount}>
              {suggestion <= 0
                ? '—'
                : `≤ ${formatCurrency(suggestion)}`}
            </Text>
            <Text style={styles.cardHint}>
              Plafond indicatif (semaine prochaine), abonnements et récurrences — détail au tap.
            </Text>
            <View style={styles.tapHint}>
              <Text style={styles.tapHintText}>Voir le détail</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.accent} />
            </View>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    paddingHorizontal: spacing.xs,
  },
  sectionSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  hScroll: {
    paddingRight: spacing.md,
    gap: GAP,
    paddingBottom: spacing.xs,
  },
  card: {
    marginLeft: spacing.xs,
  },
  pressed: {
    opacity: 0.92,
  },
  cardInner: {
    borderRadius: 20,
    padding: spacing.md,
    minHeight: 200,
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
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  cardAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  cardHint: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginTop: spacing.sm,
  },
  cardTrend: {
    fontSize: 12,
    color: colors.success,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
  },
  tapHintText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
});
