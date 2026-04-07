import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UchumiScreen } from '@/src/components/uchumi-screen';
import { useFormatCurrency } from '@/src/hooks/use-format-currency';
import { useAppStore } from '@/src/store/use-app-store';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

dayjs.locale('fr');

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const formatCurrency = useFormatCurrency();
  const transactions = useAppStore((s) => s.transactions);
  const [cursor, setCursor] = useState(() => dayjs());

  const daysInMonth = cursor.daysInMonth();
  const startWeekday = cursor.startOf('month').day();
  const cells = useMemo(() => {
    const arr: (number | null)[] = [];
    for (let i = 0; i < startWeekday; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) arr.push(d);
    return arr;
  }, [daysInMonth, startWeekday]);

  const spendByDay = useMemo(() => {
    const map = new Map<number, number>();
    const m = cursor.month();
    const y = cursor.year();
    for (const t of transactions) {
      const dt = dayjs(t.createdAt);
      if (dt.month() !== m || dt.year() !== y) continue;
      const d = dt.date();
      const add =
        t.kind === 'income'
          ? t.amountInDisplayCurrency
          : -t.amountInDisplayCurrency;
      map.set(d, (map.get(d) ?? 0) + add);
    }
    return map;
  }, [transactions, cursor]);

  return (
    <UchumiScreen style={styles.wrap}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 24 },
        ]}>
        <View style={styles.nav}>
          <Pressable onPress={() => setCursor((c) => c.subtract(1, 'month'))}>
            <Text style={styles.navBtn}>‹</Text>
          </Pressable>
          <Text style={styles.monthTitle}>
            {cursor.format('MMMM YYYY')}
          </Text>
          <Pressable onPress={() => setCursor((c) => c.add(1, 'month'))}>
            <Text style={styles.navBtn}>›</Text>
          </Pressable>
        </View>
        <View style={styles.weekRow}>
          {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d) => (
            <Text key={d} style={styles.weekday}>
              {d}
            </Text>
          ))}
        </View>
        <View style={styles.grid}>
          {cells.map((d, i) => (
            <View key={i} style={styles.cell}>
              {d === null ? null : (
                <>
                  <Text style={styles.dayNum}>{d}</Text>
                  {spendByDay.has(d) ? (
                    <Text
                      style={[
                        styles.dayAmt,
                        (spendByDay.get(d) ?? 0) >= 0
                          ? styles.pos
                          : styles.neg,
                      ]}
                      numberOfLines={1}>
                      {formatCurrency(Math.abs(spendByDay.get(d) ?? 0))}
                    </Text>
                  ) : null}
                </>
              )}
            </View>
          ))}
        </View>
        <Text style={styles.legend}>
          Par jour : flux net (entrées − sorties) en devise d’affichage.
        </Text>
      </ScrollView>
    </UchumiScreen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: spacing.sm },
  scroll: { paddingHorizontal: spacing.md },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  navBtn: {
    fontSize: 28,
    color: colors.accent,
    fontWeight: '800',
    paddingHorizontal: spacing.md,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    textTransform: 'capitalize',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    minHeight: 52,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.fuscousGray,
    padding: 4,
  },
  dayNum: { fontSize: 12, color: colors.textSecondary, fontWeight: '700' },
  dayAmt: { fontSize: 9, fontWeight: '600', marginTop: 2, fontVariant: ['tabular-nums'] },
  pos: { color: colors.success },
  neg: { color: colors.danger },
  legend: {
    marginTop: spacing.md,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
});
