import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdBannerSlot } from '@/src/components/ad-banner-slot';
import { TransactionRow } from '@/src/components/transaction-row';
import { UchumiScreen } from '@/src/components/uchumi-screen';
import { filterByPeriod, type StatsPeriod } from '@/src/domain/stats';
import { useAppStore } from '@/src/store/use-app-store';
import { colors } from '@/src/theme';
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
    <UchumiScreen style={styles.container}>
      <LinearGradient
        colors={['#353a42', '#22262c']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.heroIcon}>
              <Ionicons name="reader" size={24} color={colors.textPrimary} />
            </View>
            <View>
              <Text style={styles.title}>Mouvements</Text>
              <Text style={styles.sub}>Journal des entrées et sorties</Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push('/transaction/new')}
            style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}>
            <Ionicons name="add" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>
      </LinearGradient>

      <View style={styles.periodRow}>
        {PERIODS.map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => setPeriod(key)}
            style={[
              styles.periodChip,
              period === key && styles.periodChipActive,
            ]}>
            <Text
              style={[
                styles.periodText,
                period === key && styles.periodTextActive,
              ]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher libellé, note, tag, catégorie…"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>

      <View style={styles.hintRow}>
        <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
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
          { paddingBottom: insets.bottom + 88 },
        ]}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {emptyBecauseFilter
              ? search.trim()
                ? 'Aucun résultat pour cette recherche. Essayez d’autres mots ou effacez le champ.'
                : 'Aucun mouvement sur cette période. Changez le filtre ou enregistrez un nouveau mouvement.'
              : 'Aucun mouvement pour l’instant. Touchez + pour en créer un.'}
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
        ListFooterComponent={<AdBannerSlot />}
      />
    </UchumiScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
    flex: 1,
  },
  hero: {
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  sub: {
    fontSize: 12,
    color: 'rgba(244,241,238,0.55)',
    marginTop: 2,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  addBtnPressed: {
    opacity: 0.85,
  },
  periodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  periodChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.dune,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  periodChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.fuscousGray,
  },
  periodText: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 13,
  },
  periodTextActive: {
    color: colors.textPrimary,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.dune,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
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
    color: colors.textMuted,
    lineHeight: 17,
  },
  listFlex: {
    flex: 1,
  },
  list: {
    flexGrow: 1,
  },
  empty: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.lg,
  },
});
