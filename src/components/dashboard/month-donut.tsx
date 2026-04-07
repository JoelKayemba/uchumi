import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

type Segment = { value: number; color: string; label: string };

type MonthDonutProps = {
  segments: Segment[];
  centerLabel: string;
  centerValue: string;
};

const SIZE = 132;
const STROKE = 14;
const R = (SIZE - STROKE) / 2;
const CX = SIZE / 2;
const CY = SIZE / 2;
const C = 2 * Math.PI * R;

/**
 * Anneau proportionnel (entrées / dépenses / épargne du mois).
 */
export function MonthDonut({
  segments,
  centerLabel,
  centerValue,
}: MonthDonutProps) {
  const total = segments.reduce((s, x) => s + Math.max(0, x.value), 0);
  let offset = 0;

  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE}>
        <Circle
          cx={CX}
          cy={CY}
          r={R}
          stroke={colors.fuscousGray}
          strokeWidth={STROKE}
          fill="none"
          opacity={0.35}
        />
        {total > 0
          ? segments.map((seg, i) => {
              const v = Math.max(0, seg.value);
              if (v <= 0) return null;
              const arc = (v / total) * C;
              const el = (
                <Circle
                  key={i}
                  cx={CX}
                  cy={CY}
                  r={R}
                  stroke={seg.color}
                  strokeWidth={STROKE}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${arc} ${C}`}
                  strokeDashoffset={-offset}
                  transform={`rotate(-90 ${CX} ${CY})`}
                />
              );
              offset += arc;
              return el;
            })
          : null}
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.centerLabel}>{centerLabel}</Text>
        <Text style={styles.centerValue} numberOfLines={1}>
          {centerValue}
        </Text>
      </View>
    </View>
  );
}

export function DonutLegend({ segments }: { segments: Segment[] }) {
  return (
    <View style={styles.legend}>
      {segments.map((s) => (
        <View key={s.label} style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: s.color }]} />
          <Text style={styles.legendText} numberOfLines={1}>
            {s.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: SIZE - STROKE * 4,
  },
  centerLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  centerValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  legend: {
    gap: spacing.xs,
    flex: 1,
    justifyContent: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
});
