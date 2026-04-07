import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { currencyOptionToIso } from '@/src/constants/currencies';
import { UchumiScreen } from '@/src/components/uchumi-screen';
import { isDue } from '@/src/domain/recurring-due';
import { useFormatCurrency } from '@/src/hooks/use-format-currency';
import { getExchangeRate } from '@/src/services/exchange-rates';
import { useAppStore } from '@/src/store/use-app-store';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';
import type { RecurringFrequency } from '@/src/types/recurring';
import type { TransactionKind } from '@/src/types/transaction';

export default function RecurringScreen() {
  const insets = useSafeAreaInsets();
  const formatCurrency = useFormatCurrency();
  const currency = useAppStore((s) => s.currency);
  const rules = useAppStore((s) => s.recurringRules);
  const categories = useAppStore((s) => s.categories);
  const addRule = useAppStore((s) => s.addRecurringRule);
  const deleteRule = useAppStore((s) => s.deleteRecurringRule);
  const applyRule = useAppStore((s) => s.applyRecurringRule);

  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [kind, setKind] = useState<TransactionKind>('expense');
  const [freq, setFreq] = useState<RecurringFrequency>('monthly');

  const submit = async () => {
    const n = Number(amount.replace(',', '.'));
    if (!label.trim() || !Number.isFinite(n) || n <= 0) {
      Alert.alert('Erreur', 'Libellé et montant valides requis.');
      return;
    }
    const displayIso = currencyOptionToIso(currency);
    try {
      const rate = await getExchangeRate(displayIso, displayIso);
      const amountInDisplay = n * rate;
      addRule({
        kind,
        amount: n,
        isoCurrency: displayIso,
        rateToDisplayCurrency: rate,
        amountInDisplayCurrency: amountInDisplay,
        label: label.trim(),
        categoryId: null,
        frequency: freq,
        dayOfMonth: freq === 'monthly' ? Math.min(28, dayjs().date()) : null,
        weekday: freq === 'weekly' ? dayjs().day() : null,
        nextDueAt: dayjs().startOf('day').toISOString(),
        isActive: true,
      });
      setLabel('');
      setAmount('');
      setOpen(false);
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Conversion');
    }
  };

  return (
    <UchumiScreen style={styles.wrap}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 24 },
        ]}>
        <Text style={styles.intro}>
          Crée un mouvement identique à partir du modèle et avance la prochaine échéance. Connexion
          requise si devise ≠ affichage.
        </Text>
        <Pressable
          onPress={() => setOpen(true)}
          style={({ pressed }) => [styles.add, pressed && styles.pressed]}>
          <Ionicons name="add-circle" size={22} color={colors.textPrimary} />
          <Text style={styles.addText}>Nouvelle récurrence</Text>
        </Pressable>

        {rules.map((r) => {
          const due = isDue(r);
          const cat = r.categoryId
            ? categories.find((c) => c.id === r.categoryId)?.name
            : null;
          return (
            <View key={r.id} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.ruleTitle}>{r.label}</Text>
                <Text style={styles.ruleAmt}>
                  {formatCurrency(r.amountInDisplayCurrency)}
                </Text>
              </View>
              <Text style={styles.meta}>
                {r.frequency === 'monthly' ? 'Mensuel' : 'Hebdo'} · Prochain :{' '}
                {dayjs(r.nextDueAt).format('D MMM YYYY')}
                {cat ? ` · ${cat}` : ''}
              </Text>
              {due ? (
                <Pressable
                  onPress={() => applyRule(r.id)}
                  style={({ pressed }) => [styles.apply, pressed && styles.pressed]}>
                  <Text style={styles.applyText}>Créer le mouvement maintenant</Text>
                </Pressable>
              ) : null}
              <Pressable
                onPress={() =>
                  Alert.alert('Supprimer ?', '', [
                    { text: 'Annuler', style: 'cancel' },
                    {
                      text: 'Supprimer',
                      style: 'destructive',
                      onPress: () => deleteRule(r.id),
                    },
                  ])
                }>
                <Text style={styles.del}>Supprimer la récurrence</Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.modalBg} onPress={() => setOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Nouvelle récurrence</Text>
            <TextInput
              style={styles.in}
              placeholder="Libellé"
              placeholderTextColor={colors.textMuted}
              value={label}
              onChangeText={setLabel}
            />
            <TextInput
              style={styles.in}
              placeholder="Montant (devise affichage)"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
            <View style={styles.kindRow}>
              {(['expense', 'income', 'savings'] as const).map((k) => (
                <Pressable
                  key={k}
                  onPress={() => setKind(k)}
                  style={[styles.kind, kind === k && styles.kindOn]}>
                  <Text style={[styles.kindT, kind === k && styles.kindTOn]}>
                    {k === 'expense' ? 'Dép.' : k === 'income' ? 'Entrée' : 'Épargne'}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.kindRow}>
              {(['monthly', 'weekly'] as const).map((f) => (
                <Pressable
                  key={f}
                  onPress={() => setFreq(f)}
                  style={[styles.kind, freq === f && styles.kindOn]}>
                  <Text style={[styles.kindT, freq === f && styles.kindTOn]}>
                    {f === 'monthly' ? 'Mensuel' : 'Hebdomadaire'}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.modalRow}>
              <Pressable onPress={() => setOpen(false)}>
                <Text style={styles.cancel}>Annuler</Text>
              </Pressable>
              <Pressable onPress={() => void submit()}>
                <Text style={styles.ok}>Ajouter</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </UchumiScreen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: spacing.sm },
  scroll: { paddingHorizontal: spacing.md, gap: spacing.md },
  intro: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dune,
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  addText: { color: colors.textPrimary, fontWeight: '800', fontSize: 16 },
  pressed: { opacity: 0.88 },
  card: {
    backgroundColor: colors.dune,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: spacing.sm,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  ruleTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary, flex: 1 },
  ruleAmt: { fontSize: 16, fontWeight: '700', color: colors.textSecondary },
  meta: { fontSize: 12, color: colors.textMuted },
  apply: {
    backgroundColor: colors.fuscousGray,
    padding: spacing.sm,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyText: { color: colors.textPrimary, fontWeight: '800' },
  del: { color: colors.danger, fontSize: 13, fontWeight: '600' },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.dune,
    borderRadius: 18,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  in: {
    backgroundColor: colors.marshland,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    color: colors.textPrimary,
    padding: 12,
    fontSize: 16,
  },
  kindRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  kind: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.marshland,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  kindOn: { borderColor: colors.accent },
  kindT: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  kindTOn: { color: colors.textPrimary },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  cancel: { color: colors.textMuted, fontSize: 16 },
  ok: { color: colors.accent, fontWeight: '800', fontSize: 16 },
});
