import { StyleSheet, Text, View } from 'react-native';

import type { DayBar } from '@/src/domain/dashboard-charts';
import { maxBarValue } from '@/src/domain/dashboard-charts';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

type WeekBarsProps = {
  bars: DayBar[];
  title: string;
};

const BAR_MAX_H = 64;

export function WeekBars({ bars, title }: WeekBarsProps) {
  const max = maxBarValue(bars);

  return (
    <View style={styles.block}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.row}>
        {bars.map((b, i) => {
          const hOut = max > 0 ? (b.outflow / max) * BAR_MAX_H : 0;
          const hIn = max > 0 ? (b.inflow / max) * BAR_MAX_H : 0;
          return (
            <View key={i} style={styles.day}>
              <View style={styles.barPair}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barIn,
                      {
                        height:
                          hIn <= 0 ? 0 : Math.max(3, Math.min(BAR_MAX_H - 4, hIn)),
                      },
                    ]}
                  />
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barOut,
                      {
                        height:
                          hOut <= 0 ? 0 : Math.max(3, Math.min(BAR_MAX_H - 4, hOut)),
                      },
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.dayLabel}>{b.label}</Text>
            </View>
          );
        })}
      </View>
      <View style={styles.hintRow}>
        <View style={styles.hintItem}>
          <View style={[styles.mini, { backgroundColor: colors.success }]} />
          <Text style={styles.hintText}>Entrées</Text>
        </View>
        <View style={styles.hintItem}>
          <View style={[styles.mini, { backgroundColor: colors.danger }]} />
          <Text style={styles.hintText}>Sorties</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 2,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  barPair: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'flex-end',
    height: BAR_MAX_H,
  },
  barTrack: {
    flex: 1,
    height: BAR_MAX_H,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    overflow: 'hidden',
    paddingBottom: 2,
  },
  barIn: {
    width: '88%',
    borderRadius: 5,
    backgroundColor: colors.success,
    minHeight: 2,
    opacity: 0.95,
  },
  barOut: {
    width: '88%',
    borderRadius: 5,
    backgroundColor: colors.danger,
    minHeight: 2,
    opacity: 0.9,
  },
  dayLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  hintRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  hintItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mini: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  hintText: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
