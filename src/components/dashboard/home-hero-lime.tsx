import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

type Props = {
  /** 0–1 : part des dépenses du mois par rapport aux entrées (indicatif). */
  budgetProgress: number;
  balanceLabel: string;
  onPressAdd: () => void;
};

const CARD_MIN_HEIGHT = 228;
const CORNER_R = 22;
const NOTCH_R = 54;
const GRAD_ID = 'homeWalletCardGrad';

function buildWalletPath(W: number, H: number, r: number, notchR: number): string {
  if (W < 120 || H < 100) return '';
  const rr = Math.min(r, (W - notchR) / 2, (H - notchR) / 2);
  const Rc = Math.min(notchR, W * 0.45, H * 0.45);
  return [
    `M ${rr} 0`,
    `L ${W - rr} 0`,
    `A ${rr} ${rr} 0 0 1 ${W} ${rr}`,
    `L ${W} ${H - Rc}`,
    `A ${Rc} ${Rc} 0 0 1 ${W - Rc} ${H}`,
    `L ${rr} ${H}`,
    `A ${rr} ${rr} 0 0 1 0 ${H - rr}`,
    `L 0 ${rr}`,
    `A ${rr} ${rr} 0 0 1 ${rr} 0`,
    'Z',
  ].join(' ');
}

export function HomeHeroLime({
  budgetProgress,
  balanceLabel,
  onPressAdd,
}: Props) {
  const [cardW, setCardW] = useState(0);
  const p = Math.min(1, Math.max(0, budgetProgress));

  const pathD = useMemo(
    () => buildWalletPath(cardW, CARD_MIN_HEIGHT, CORNER_R, NOTCH_R),
    [cardW]
  );

  const expLabel = useMemo(
    () => dayjs().add(3, 'year').format('MM/YY'),
    []
  );

  return (
    <View style={styles.outer}>
      <View
        style={styles.cardWrap}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0 && Math.abs(w - cardW) > 0.5) setCardW(w);
        }}>
        {cardW > 0 && pathD ? (
          <Svg
            width={cardW}
            height={CARD_MIN_HEIGHT}
            style={styles.svgBg}>
            <Defs>
              <LinearGradient id={GRAD_ID} x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={colors.lime} />
                <Stop offset="1" stopColor={colors.limeMuted} />
              </LinearGradient>
            </Defs>
            <Path d={pathD} fill={`url(#${GRAD_ID})`} />
          </Svg>
        ) : null}

        <View style={styles.cardContent} pointerEvents="box-none">
          <View style={styles.cardInner}>
            <View>
              <View style={styles.topRow}>
                <View style={styles.brandIcon}>
                  <Ionicons name="wallet" size={20} color={colors.limeDark} />
                </View>
                <Text style={styles.pan} numberOfLines={1}>
                  **** **** **** 7216
                </Text>
              </View>

              <View style={styles.midRow}>
                <View style={styles.midLeft}>
                  <Text style={styles.balanceLabel}>Solde</Text>
                  <Text style={styles.balanceAmount} numberOfLines={2}>
                    {balanceLabel}
                  </Text>
                  <Text style={styles.hint} numberOfLines={1}>
                    Solde estimé
                  </Text>
                </View>
                <View style={styles.midRight}>
                  <Text style={styles.expKicker}>Exp.</Text>
                  <Text style={styles.expValue}>{expLabel}</Text>
                </View>
              </View>
            </View>

            <View style={styles.bottomRow}>
              <Text style={styles.nameKicker}>Nom</Text>
              <Text style={styles.nameValue}>UCHUMI</Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={onPressAdd}
          accessibilityRole="button"
          accessibilityLabel="Nouveau mouvement"
          style={({ pressed }) => [
            styles.ctaPill,
            pressed && styles.ctaPressed,
          ]}>
          <View style={styles.ctaIconBubble}>
            <Ionicons name="add" size={20} color={colors.ink} />
          </View>
          <Text style={styles.ctaText}>Ajouter</Text>
        </Pressable>
      </View>

      <Text style={styles.caption}>
        {p <= 0
          ? 'Aucune entrée ce mois-ci'
          : `≈ ${Math.round(p * 100)} % du budget mensuel utilisé (sorties / entrées)`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    overflow: 'visible',
    zIndex: 2,
  },
  cardWrap: {
    position: 'relative',
    height: CARD_MIN_HEIGHT,
    overflow: 'visible',
  },
  svgBg: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: 0,
  },
  cardContent: {
    ...StyleSheet.absoluteFillObject,
  },
  cardInner: {
    flex: 1,
    paddingTop: spacing.md + 4,
    paddingLeft: spacing.md + 4,
    paddingRight: spacing.md + 4,
    paddingBottom: spacing.md + 52,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pan: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    opacity: 0.88,
    letterSpacing: 0.8,
    fontVariant: ['tabular-nums'],
  },
  midRow: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  midLeft: {
    flex: 1,
    minWidth: 0,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  balanceAmount: {
    marginTop: 4,
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.8,
    lineHeight: 32,
  },
  hint: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    lineHeight: 15,
  },
  midRight: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 18,
    minWidth: 72,
  },
  expKicker: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  expValue: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  bottomRow: {
    paddingTop: spacing.sm,
  },
  nameKicker: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  nameValue: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },
  /** Bouton noir dans l’encoche bas-droite (réf. maquette) */
  ctaPill: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingLeft: 6,
    paddingRight: 14,
    borderRadius: 999,
    backgroundColor: colors.ink,
    zIndex: 10,
  },
  ctaPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  ctaIconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  caption: {
    marginTop: spacing.sm,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    lineHeight: 16,
    paddingHorizontal: 2,
  },
});
