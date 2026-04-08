import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/src/components/screen-header';
import { UchumiScreen } from '@/src/components/uchumi-screen';
import { spendInCategoryThisMonth } from '@/src/domain/budgets';
import { useFormatCurrency } from '@/src/hooks/use-format-currency';
import { useAppStore } from '@/src/store/use-app-store';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

export default function BudgetsScreen() {
  const insets = useSafeAreaInsets();
  const formatCurrency = useFormatCurrency();
  const categories = useAppStore((s) => s.categories);
  const transactions = useAppStore((s) => s.transactions);
  const categoryBudgets = useAppStore((s) => s.categoryBudgets);
  const setCategoryBudget = useAppStore((s) => s.setCategoryBudget);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const rows = useMemo(
    () =>
      categories.map((c) => {
        const limit = categoryBudgets[c.id] ?? 0;
        const spent = spendInCategoryThisMonth(transactions, c.id);
        const ratio = limit > 0 ? Math.min(1, spent / limit) : 0;
        const over = limit > 0 && spent > limit;
        return { cat: c, limit, spent, ratio, over };
      }),
    [categories, categoryBudgets, transactions]
  );

  const saveLimit = (categoryId: string) => {
    const raw = (drafts[categoryId] ?? '').replace(',', '.').trim();
    if (raw === '') {
      setCategoryBudget(categoryId, null);
      return;
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) {
      Alert.alert('Montant invalide', 'Indiquez un nombre positif ou vide pour retirer le plafond.');
      return;
    }
    setCategoryBudget(categoryId, n);
  };

  return (
    <UchumiScreen style={styles.wrap}>
      <ScreenHeader title="Budgets" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Plafond mensuel par catégorie (dépenses + épargne), en devise d’affichage. 0 ou vide = pas
          de limite.
        </Text>
        {rows.map(({ cat, limit, spent, ratio, over }) => (
          <View key={cat.id} style={styles.card}>
            <View style={styles.cardHead}>
              <View style={[styles.dot, { backgroundColor: cat.color }]} />
              <Text style={styles.catName}>{cat.name}</Text>
            </View>
            <Text style={styles.spent}>
              Utilisé ce mois : {formatCurrency(spent)}
              {limit > 0 ? ` / ${formatCurrency(limit)}` : ''}
            </Text>
            {limit > 0 ? (
              <View style={styles.track}>
                <LinearGradient
                  colors={over ? [colors.danger, '#8b3a3a'] : [colors.accent, '#6b635a']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.fill, { width: `${ratio * 100}%` }]}
                />
              </View>
            ) : null}
            {over ? (
              <Text style={styles.warn}>Budget dépassé sur cette catégorie.</Text>
            ) : null}
            <View style={styles.row}>
              <TextInput
                style={styles.input}
                placeholder="Plafond mensuel"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                value={
                  drafts[cat.id] !== undefined
                    ? drafts[cat.id]
                    : limit > 0
                      ? String(limit)
                      : ''
                }
                onChangeText={(t) =>
                  setDrafts((d) => ({ ...d, [cat.id]: t }))
                }
              />
              <Pressable
                onPress={() => saveLimit(cat.id)}
                style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}>
                <Ionicons name="checkmark-circle" size={26} color={colors.success} />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </UchumiScreen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: spacing.sm },
  scroll: { gap: spacing.md },
  intro: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.dune,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: spacing.sm,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 12, height: 12, borderRadius: 6 },
  catName: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  spent: { fontSize: 14, color: colors.textSecondary },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.marshland,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 5 },
  warn: { fontSize: 12, color: colors.danger, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: {
    flex: 1,
    backgroundColor: colors.marshland,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 16,
  },
  saveBtn: { padding: 4 },
  pressed: { opacity: 0.85 },
});
