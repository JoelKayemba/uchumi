import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

type Props = {
  /** 0–1 : part des dépenses du mois par rapport aux entrées (indicatif). */
  budgetProgress: number;
  balanceLabel: string;
  balanceHint: string;
};

const RING = 56;
const STROKE = 6;
const R = (RING - STROKE) / 2;
const CX = RING / 2;
const CY = RING / 2;
const C = 2 * Math.PI * R;

export function HomeHeroLime({
  budgetProgress,
  balanceLabel,
  balanceHint,
}: Props) {
  const p = Math.min(1, Math.max(0, budgetProgress));
  const arc = p * C;

  return (
    <LinearGradient
      colors={[colors.lime, colors.limeMuted]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}>
      <View style={styles.row}>
        <View style={styles.textCol}>
          <Text style={styles.kicker}>Portefeuille</Text>
          <Text style={styles.amount}>{balanceLabel}</Text>
          <Text style={styles.hint}>{balanceHint}</Text>
        </View>
        <View style={styles.ringWrap}>
          <Svg width={RING} height={RING}>
            <Circle
              cx={CX}
              cy={CY}
              r={R}
              stroke="rgba(255,255,255,0.45)"
              strokeWidth={STROKE}
              fill="none"
            />
            <Circle
              cx={CX}
              cy={CY}
              r={R}
              stroke="#FFFFFF"
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${arc} ${C}`}
              transform={`rotate(-90 ${CX} ${CY})`}
            />
          </Svg>
          <View style={styles.ringCenter}>
            <Ionicons name="wallet" size={22} color={colors.limeDark} />
          </View>
        </View>
      </View>
      <Text style={styles.ringCaption}>
        {p <= 0
          ? 'Aucune entrée ce mois-ci'
          : `≈ ${Math.round(p * 100)} % du budget mensuel utilisé (sorties / entrées)`}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 26,
    padding: spacing.lg,
    ...StyleSheet.flatten({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 5,
    }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  amount: {
    marginTop: 6,
    fontSize: 34,
    fontWeight: '800',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  hint: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  ringWrap: {
    width: RING,
    height: RING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCaption: {
    marginTop: spacing.md,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
