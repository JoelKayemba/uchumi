import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TransactionRow } from '@/src/components/transaction-row';
import { UchumiScreen } from '@/src/components/uchumi-screen';
import { filterByPeriod, type StatsPeriod } from '@/src/domain/stats';
import { useAppStore } from '@/src/store/use-app-store';
import { finShell } from '@/src/theme/fin-shell';
import { TAB_BAR_FLOAT_BOTTOM_OFFSET } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

const PERIODS: { key: StatsPeriod; label: string }[] = [
  { key: 'week', label: 'Semaine' },
  { key: 'month', label: 'Mois' },
  { key: 'all', label: 'Tout' },
];

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [period, setPeriod] = useState<StatsPeriod>('month');
  const [search, setSearch] = useState('');
  const transactions = useAppStore((s) => s.transactions);
  const categories = useAppStore((s) => s.categories);
  const deleteTransaction = useAppStore((s) => s.deleteTransaction);

  const filtered = useMemo(
    () => filterByPeriod(transactions, period),
    [transactions, period]
  );

  const categoryById = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of categories) {
      m.set(c.id, c.name);
    }
    return m;
  }, [categories]);

  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return filtered;
    return filtered.filter((t) => {
      if (t.label.toLowerCase().includes(q)) return true;
      if (t.note.toLowerCase().includes(q)) return true;
      if (t.tags.some((tag) => tag.toLowerCase().includes(q))) return true;
      const cat = t.categoryId ? categoryById.get(t.categoryId) : undefined;
      if (cat?.toLowerCase().includes(q)) return true;
      return false;
    });
  }, [filtered, search, categoryById]);

  const categoryName = (id: string | null) =>
    id ? categories.find((c) => c.id === id)?.name : undefined;

  const emptyBecauseFilter =
    filteredList.length === 0 && transactions.length > 0;

  return (
    <UchumiScreen style={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.heroTab} />
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.heroIcon}>
              <Ionicons name="reader" size={24} color={finShell.purple} />
            </View>
            <View>
              <Text style={styles.kicker}>Journal</Text>
              <Text style={styles.title}>Mouvements</Text>
              <Text style={styles.sub}>Entrées, dépenses et épargne</Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push('/transaction/new')}
            style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
            accessibilityLabel="Nouveau mouvement">
            <Ionicons name="add" size={26} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <View style={styles.periodRow}>
        {PERIODS.map(({ key, label }) => {
          const on = period === key;
          return (
            <Pressable
              key={key}
              onPress={() => setPeriod(key)}
              style={[styles.periodChip, on && styles.periodChipOn]}>
              <Text style={[styles.periodText, on && styles.periodTextOn]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={20} color={finShell.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Libellé, note, tag, catégorie…"
          placeholderTextColor={finShell.muted}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>

      <View style={styles.hintRow}>
        <Ionicons name="information-circle-outline" size={16} color={finShell.muted} />
        <Text style={styles.hint}>
          Touchez une ligne pour modifier · appui long pour supprimer.
        </Text>
      </View>

      <FlatList
        style={styles.listFlex}
        data={filteredList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + TAB_BAR_FLOAT_BOTTOM_OFFSET },
        ]}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {emptyBecauseFilter
              ? search.trim()
                ? 'Aucun résultat pour cette recherche.'
                : 'Aucun mouvement sur cette période.'
              : 'Aucun mouvement pour l’instant. Utilisez le bouton + ou l’accueil pour en créer un.'}
          </Text>
        }
        renderItem={({ item }) => (
          <TransactionRow
            transaction={item}
            categoryName={categoryName(item.categoryId)}
            onPress={() => router.push(`/transaction/${item.id}`)}
            onDelete={deleteTransaction}
          />
        )}
      />
    </UchumiScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: finShell.page,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  hero: {
    borderRadius: 28,
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: finShell.card,
    borderWidth: 1,
    borderColor: finShell.border,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.07,
        shadowRadius: 16,
      },
      android: { elevation: 3 },
    }),
  },
  heroTab: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 6,
    backgroundColor: finShell.purple,
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '800',
    color: finShell.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(138,112,245,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: finShell.ink,
    letterSpacing: -0.4,
  },
  sub: {
    fontSize: 12,
    color: finShell.sub,
    marginTop: 2,
  },
  addBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: finShell.ink,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  addBtnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  periodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  periodChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: finShell.barTrack,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  periodChipOn: {
    backgroundColor: finShell.ink,
    borderColor: finShell.ink,
  },
  periodText: {
    color: finShell.sub,
    fontWeight: '700',
    fontSize: 14,
  },
  periodTextOn: {
    color: '#FFFFFF',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 18,
    backgroundColor: finShell.barTrack,
    borderWidth: 1,
    borderColor: finShell.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: finShell.ink,
    paddingVertical: 4,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: spacing.sm,
    paddingHorizontal: 2,
  },
  hint: {
    flex: 1,
    fontSize: 12,
    color: finShell.muted,
    lineHeight: 17,
  },
  listFlex: {
    flex: 1,
  },
  list: {
    flexGrow: 1,
    paddingTop: spacing.xs,
  },
  empty: {
    color: finShell.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.lg,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});
