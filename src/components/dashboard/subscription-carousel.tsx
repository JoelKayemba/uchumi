import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SubscriptionPresetLogo } from '@/src/components/subscription-preset-logo';
import type { CurrencyOptionId } from '@/src/constants/currencies';
import { daysUntilNextBilling } from '@/src/domain/subscription-dates';
import { subscriptionAmountToDisplay } from '@/src/domain/subscription-amount';
import { formatCurrency } from '@/src/lib/format-currency';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';
import type { Subscription } from '@/src/types/subscription';

type Props = {
  subscriptions: readonly Subscription[];
  displayCurrency: CurrencyOptionId;
  onPressSubscription?: (sub: Subscription) => void;
  onPressSeeAll?: () => void;
};

const CARD_W = 168;

export function SubscriptionCarousel({
  subscriptions,
  displayCurrency,
  onPressSubscription,
  onPressSeeAll,
}: Props) {
  const rows = useMemo(() => {
    const active = subscriptions.filter((s) => s.isActive && s.isMonthlyRecurring);
    const withDays = active.map((s) => ({
      sub: s,
      days: daysUntilNextBilling(s.billingDayOfMonth),
    }));
    withDays.sort((a, b) => a.days - b.days || a.sub.name.localeCompare(b.sub.name));
    return withDays;
  }, [subscriptions]);

  if (rows.length === 0) {
    return null;
  }

  const highlightId = rows[0]?.sub.id;

  return (
    <View style={styles.block}>
      <View style={styles.headRow}>
        <Text style={styles.sectionTitle}>Prochains prélèvements</Text>
        {onPressSeeAll ? (
          <Pressable onPress={onPressSeeAll} hitSlop={10}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </Pressable>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        decelerationRate="fast"
        snapToInterval={CARD_W + spacing.sm}
        snapToAlignment="start">
        {rows.map(({ sub, days }) => {
          const amt = subscriptionAmountToDisplay(
            sub.amount,
            sub.currencyId,
            displayCurrency
          );
          const amtLabel = formatCurrency(amt, displayCurrency);
          const isHighlight = sub.id === highlightId;
          const countdown =
            days === 0
              ? 'Aujourd’hui'
              : days === 1
                ? '1 jour restant'
                : `${days} j. restants`;

          return (
            <Pressable
              key={sub.id}
              onPress={() => onPressSubscription?.(sub)}
              style={({ pressed }) => [
                styles.cardWrap,
                pressed && styles.pressed,
              ]}>
              {isHighlight ? (
                <LinearGradient
                  colors={[colors.subscriptionPurple, colors.subscriptionPurpleLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardInner}>
                  <View style={styles.cardTop}>
                    <SubscriptionPresetLogo preset={sub.preset} size={44} />
                    <View style={styles.badgeLight}>
                      <Text style={styles.badgeLightText}>Bientôt</Text>
                    </View>
                  </View>
                  <Text style={styles.nameOn} numberOfLines={1}>
                    {sub.name}
                  </Text>
                  <Text style={styles.priceOn}>{amtLabel}/mois</Text>
                  <Text style={styles.countOn}>{countdown}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.cardMuted}>
                  <View style={styles.cardTop}>
                    <SubscriptionPresetLogo preset={sub.preset} size={44} />
                  </View>
                  <Text style={styles.nameOff} numberOfLines={1}>
                    {sub.name}
                  </Text>
                  <Text style={styles.priceOff}>{amtLabel}/mois</Text>
                  <Text style={styles.countOff}>{countdown}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.sm,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.subscriptionPurple,
  },
  scroll: {
    paddingRight: spacing.md,
    gap: spacing.sm,
  },
  cardWrap: {
    width: CARD_W,
  },
  pressed: {
    opacity: 0.92,
  },
  cardInner: {
    borderRadius: 22,
    padding: spacing.md,
    minHeight: 168,
    ...StyleSheet.flatten({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    }),
  },
  cardMuted: {
    borderRadius: 22,
    padding: spacing.md,
    minHeight: 168,
    backgroundColor: colors.dune,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  badgeLight: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  badgeLightText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  nameOn: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  priceOn: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.92)',
    fontVariant: ['tabular-nums'],
  },
  countOn: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.92)',
  },
  nameOff: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  priceOff: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  countOff: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
