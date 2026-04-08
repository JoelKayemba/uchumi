import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { currencyOptionToIso } from '@/src/constants/currencies';
import {
  SilkyModalize,
  type ModalizeRef,
} from '@/src/components/silky-modalize';
import { ScreenHeader } from '@/src/components/screen-header';
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

  const recurringModalRef = useRef<ModalizeRef>(null);
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
      recurringModalRef.current?.close();
    } catch (e) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Conversion');
    }
  };

  return (
    <UchumiScreen style={styles.wrap}>
      <ScreenHeader title="Récurrences" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 24 },
        ]}>
        <Text style={styles.intro}>
          Crée un mouvement identique à partir du modèle et avance la prochaine échéance. Connexion
          requise si devise ≠ affichage.
        </Text>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => recurringModalRef.current?.open()}
          style={styles.add}>
          <Ionicons name="add-circle" size={22} color={colors.textPrimary} />
          <Text style={styles.addText}>Nouvelle récurrence</Text>
        </TouchableOpacity>

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
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => applyRule(r.id)}
                  style={styles.apply}>
                  <Text style={styles.applyText}>Créer le mouvement maintenant</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  Alert.alert('Supprimer ?', '', [
                    { text: 'Annuler', style: 'cancel' },
                    {
                      text: 'Supprimer',
                      style: 'destructive',
                      onPress: () => deleteRule(r.id),
                    },
                  ])
                }
                style={styles.delBtn}>
                <Text style={styles.del}>Supprimer la récurrence</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      <SilkyModalize
        ref={recurringModalRef}
        adjustToContentHeight
        childrenStyle={styles.modalChildren}
        onClosed={() => {
          setLabel('');
          setAmount('');
        }}
        scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}>
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
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Type de mouvement</Text>
          <View style={styles.kindRow}>
            {(['expense', 'income', 'savings'] as const).map((k) => (
              <TouchableOpacity
                key={k}
                activeOpacity={0.82}
                onPress={() => setKind(k)}
                style={[styles.kind, kind === k && styles.kindOn]}>
                <Text style={[styles.kindT, kind === k && styles.kindTOn]}>
                  {k === 'expense' ? 'Dép.' : k === 'income' ? 'Entrée' : 'Épargne'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Fréquence</Text>
          <View style={styles.kindRow}>
            {(['monthly', 'weekly'] as const).map((f) => (
              <TouchableOpacity
                key={f}
                activeOpacity={0.82}
                onPress={() => setFreq(f)}
                style={[styles.kind, freq === f && styles.kindOn]}>
                <Text style={[styles.kindT, freq === f && styles.kindTOn]}>
                  {f === 'monthly' ? 'Mensuel' : 'Hebdomadaire'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.modalBtnRow}>
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.modalBtnGhost}
            onPress={() => recurringModalRef.current?.close()}>
            <Text style={styles.modalBtnGhostLabel}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.modalBtnPrimary}
            onPress={() => void submit()}>
            <Text style={styles.modalBtnPrimaryLabel}>Ajouter</Text>
          </TouchableOpacity>
        </View>
      </SilkyModalize>
    </UchumiScreen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: spacing.sm },
  scroll: { gap: spacing.md },
  intro: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dune,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.md + 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  addText: { color: colors.textPrimary, fontWeight: '800', fontSize: 16 },
  card: {
    backgroundColor: colors.dune,
    borderRadius: 16,
    padding: spacing.md + 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: spacing.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  ruleTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary, flex: 1 },
  ruleAmt: { fontSize: 16, fontWeight: '700', color: colors.textSecondary },
  meta: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },
  apply: {
    backgroundColor: colors.fuscousGray,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: { color: colors.textPrimary, fontWeight: '800', fontSize: 15 },
  delBtn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xs,
    borderRadius: 10,
    backgroundColor: 'rgba(232, 93, 76, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(232, 93, 76, 0.22)',
  },
  del: { color: colors.danger, fontSize: 14, fontWeight: '700' },
  modalChildren: {
    gap: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  in: {
    backgroundColor: colors.marshland,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    color: colors.textPrimary,
    paddingVertical: Platform.OS === 'ios' ? 16 : 14,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    minHeight: 52,
  },
  fieldBlock: {
    gap: spacing.sm,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  kindRow: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  kind: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md + 4,
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.marshland,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  kindOn: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(46, 204, 113, 0.12)',
  },
  kindT: { color: colors.textMuted, fontSize: 14, fontWeight: '700' },
  kindTOn: { color: colors.textPrimary },
  modalBtnRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.fuscousGray,
  },
  modalBtnGhost: {
    flex: 1,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    backgroundColor: colors.marshland,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnGhostLabel: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
  modalBtnPrimary: {
    flex: 1,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnPrimaryLabel: {
    color: colors.textOnDark,
    fontWeight: '800',
    fontSize: 16,
  },
});
