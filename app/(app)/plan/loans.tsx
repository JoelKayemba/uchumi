import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  SilkyModalize,
  type ModalizeRef,
} from '@/src/components/silky-modalize';
import { ScreenHeader } from '@/src/components/screen-header';
import { UchumiScreen } from '@/src/components/uchumi-screen';
import {
  clampDebitDay,
  estimatedInstallmentsLeft,
} from '@/src/domain/loan-accrual';
import { getNextBillingDate } from '@/src/domain/subscription-dates';
import { useFormatCurrency } from '@/src/hooks/use-format-currency';
import type { Loan } from '@/src/types/loan';
import { useAppStore } from '@/src/store/use-app-store';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

dayjs.locale('fr');

function parseNum(s: string): number {
  return Number(s.replace(',', '.').trim());
}

export default function LoansScreen() {
  const insets = useSafeAreaInsets();
  const formatCurrency = useFormatCurrency();
  const loans = useAppStore((s) => s.loans);
  const addLoan = useAppStore((s) => s.addLoan);
  const updateLoan = useAppStore((s) => s.updateLoan);
  const deleteLoan = useAppStore((s) => s.deleteLoan);
  const syncLoanDeductions = useAppStore((s) => s.syncLoanDeductions);

  const loanModalRef = useRef<ModalizeRef>(null);
  const editModalRef = useRef<ModalizeRef>(null);

  const [name, setName] = useState('');
  const [totalStr, setTotalStr] = useState('');
  const [monthlyStr, setMonthlyStr] = useState('');
  const [debitDayStr, setDebitDayStr] = useState('1');
  const [remainingOptStr, setRemainingOptStr] = useState('');

  const [editing, setEditing] = useState<Loan | null>(null);
  const [editTotal, setEditTotal] = useState('');
  const [editMonthly, setEditMonthly] = useState('');
  const [editDebit, setEditDebit] = useState('');
  const [editRemaining, setEditRemaining] = useState('');

  useFocusEffect(
    useCallback(() => {
      syncLoanDeductions();
    }, [syncLoanDeductions])
  );

  const submitNew = () => {
    const total = parseNum(totalStr);
    const monthly = parseNum(monthlyStr);
    const debitDay = clampDebitDay(parseInt(debitDayStr, 10) || 1);
    const remainingRaw = remainingOptStr.trim()
      ? parseNum(remainingOptStr)
      : total;

    if (!name.trim()) {
      Alert.alert('Erreur', 'Indiquez un nom pour le crédit.');
      return;
    }
    if (!Number.isFinite(total) || total <= 0) {
      Alert.alert('Erreur', 'Le montant total doit être un nombre positif.');
      return;
    }
    if (!Number.isFinite(monthly) || monthly <= 0) {
      Alert.alert('Erreur', 'La mensualité doit être un nombre positif.');
      return;
    }
    if (!Number.isFinite(remainingRaw) || remainingRaw < 0 || remainingRaw > total) {
      Alert.alert(
        'Erreur',
        'Le solde restant doit être entre 0 et le montant total (ou laissez vide pour repartir du total).'
      );
      return;
    }

    addLoan({
      name: name.trim(),
      totalAmount: total,
      monthlyPayment: monthly,
      remainingAmount: remainingRaw,
      debitDay,
      createdAt: new Date().toISOString(),
      lastProcessedMonth: null,
      note: '',
    });
    setName('');
    setTotalStr('');
    setMonthlyStr('');
    setDebitDayStr('1');
    setRemainingOptStr('');
    loanModalRef.current?.close();
  };

  const openEdit = (l: Loan) => {
    setEditing(l);
    setEditTotal(String(l.totalAmount));
    setEditMonthly(String(l.monthlyPayment));
    setEditDebit(String(l.debitDay));
    setEditRemaining(String(l.remainingAmount));
    editModalRef.current?.open();
  };

  const submitEdit = () => {
    if (!editing) return;
    const total = parseNum(editTotal);
    const monthly = parseNum(editMonthly);
    const debitDay = clampDebitDay(parseInt(editDebit, 10) || 1);
    const remaining = parseNum(editRemaining);

    if (!Number.isFinite(total) || total <= 0) {
      Alert.alert('Erreur', 'Montant total invalide.');
      return;
    }
    if (!Number.isFinite(monthly) || monthly <= 0) {
      Alert.alert('Erreur', 'Mensualité invalide.');
      return;
    }
    if (!Number.isFinite(remaining) || remaining < 0 || remaining > total) {
      Alert.alert('Erreur', 'Solde restant invalide (0 … total).');
      return;
    }

    updateLoan(editing.id, {
      totalAmount: total,
      monthlyPayment: monthly,
      debitDay,
      remainingAmount: remaining,
    });
    setEditing(null);
    editModalRef.current?.close();
  };

  return (
    <UchumiScreen style={styles.wrap}>
      <ScreenHeader title="Crédits" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 24 },
        ]}>
        <Text style={styles.intro}>
          Saisissez le montant total du prêt, la mensualité et le jour de prélèvement. Chaque mois,
          après cette date, le solde est diminué automatiquement (vous pouvez toujours corriger le
          reste dû à la main).
        </Text>
        <Pressable
          onPress={() => loanModalRef.current?.open()}
          style={({ pressed }) => [styles.add, pressed && styles.pressed]}>
          <Ionicons name="add" size={22} color={colors.textPrimary} />
          <Text style={styles.addText}>Ajouter un crédit</Text>
        </Pressable>

        {loans.map((l) => {
          const next = getNextBillingDate(l.debitDay);
          const left = estimatedInstallmentsLeft(l);
          return (
            <View key={l.id} style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={styles.loanName}>{l.name}</Text>
                <Pressable
                  onPress={() => openEdit(l)}
                  hitSlop={8}
                  style={({ pressed }) => pressed && styles.pressed}>
                  <Text style={styles.editLink}>Modifier</Text>
                </Pressable>
              </View>
              <Text style={styles.line}>
                Montant total : {formatCurrency(l.totalAmount)}
              </Text>
              <Text style={styles.line}>
                Reste dû : {formatCurrency(l.remainingAmount)}
              </Text>
              <Text style={styles.line}>
                Mensualité : {formatCurrency(l.monthlyPayment)}
              </Text>
              <Text style={styles.lineMuted}>
                Prélèvement le {l.debitDay} de chaque mois · prochain :{' '}
                {next.format('D MMMM YYYY')}
              </Text>
              {left != null && left > 0 ? (
                <Text style={styles.lineMuted}>≈ {left} mensualité(s) restante(s)</Text>
              ) : null}
              <TextInput
                key={`${l.id}-rem-${l.remainingAmount}`}
                style={styles.in}
                placeholder="Corriger le reste dû manuellement"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                defaultValue={String(l.remainingAmount)}
                onEndEditing={(e) => {
                  const n = parseNum(e.nativeEvent.text);
                  if (Number.isFinite(n) && n >= 0 && n <= l.totalAmount) {
                    updateLoan(l.id, { remainingAmount: n });
                  } else if (Number.isFinite(n) && n > l.totalAmount) {
                    Alert.alert('Montant trop élevé', 'Le reste dû ne peut pas dépasser le montant total.');
                  }
                }}
              />
              <Pressable
                onPress={() =>
                  Alert.alert('Supprimer ?', '', [
                    { text: 'Annuler', style: 'cancel' },
                    {
                      text: 'Supprimer',
                      style: 'destructive',
                      onPress: () => deleteLoan(l.id),
                    },
                  ])
                }>
                <Text style={styles.del}>Supprimer</Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      <SilkyModalize
        ref={loanModalRef}
        adjustToContentHeight
        childrenStyle={{ gap: spacing.sm }}
        onClosed={() => {
          setName('');
          setTotalStr('');
          setMonthlyStr('');
          setDebitDayStr('1');
          setRemainingOptStr('');
        }}
        scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}>
        <Text style={styles.modalTitle}>Nouveau crédit</Text>
        <TextInput
          style={styles.in}
          placeholder="Nom"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.in}
          placeholder="Montant total emprunté"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          value={totalStr}
          onChangeText={setTotalStr}
        />
        <TextInput
          style={styles.in}
          placeholder="Mensualité"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          value={monthlyStr}
          onChangeText={setMonthlyStr}
        />
        <TextInput
          style={styles.in}
          placeholder="Jour de prélèvement (1–28)"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          value={debitDayStr}
          onChangeText={setDebitDayStr}
        />
        <TextInput
          style={styles.in}
          placeholder="Solde restant actuel (optionnel, défaut = total)"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          value={remainingOptStr}
          onChangeText={setRemainingOptStr}
        />
        <Text style={styles.hintModal}>
          Le solde baisse chaque mois après le jour choisi, tant que vous ouvrez l’app.
        </Text>
        <View style={styles.modalRow}>
          <Pressable onPress={() => loanModalRef.current?.close()}>
            <Text style={styles.cancel}>Annuler</Text>
          </Pressable>
          <Pressable onPress={submitNew}>
            <Text style={styles.ok}>Ajouter</Text>
          </Pressable>
        </View>
      </SilkyModalize>

      <SilkyModalize
        ref={editModalRef}
        adjustToContentHeight
        childrenStyle={{ gap: spacing.sm }}
        onClosed={() => setEditing(null)}
        scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}>
        <Text style={styles.modalTitle}>Modifier le crédit</Text>
        <Text style={styles.editName}>{editing?.name}</Text>
        <TextInput
          style={styles.in}
          placeholder="Montant total"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          value={editTotal}
          onChangeText={setEditTotal}
        />
        <TextInput
          style={styles.in}
          placeholder="Mensualité"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          value={editMonthly}
          onChangeText={setEditMonthly}
        />
        <TextInput
          style={styles.in}
          placeholder="Jour de prélèvement (1–28)"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          value={editDebit}
          onChangeText={setEditDebit}
        />
        <TextInput
          style={styles.in}
          placeholder="Reste dû actuel"
          placeholderTextColor={colors.textMuted}
          keyboardType="decimal-pad"
          value={editRemaining}
          onChangeText={setEditRemaining}
        />
        <View style={styles.modalRow}>
          <Pressable onPress={() => editModalRef.current?.close()}>
            <Text style={styles.cancel}>Annuler</Text>
          </Pressable>
          <Pressable onPress={submitEdit}>
            <Text style={styles.ok}>Enregistrer</Text>
          </Pressable>
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
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  loanName: { fontSize: 18, fontWeight: '800', color: colors.textPrimary, flex: 1 },
  editLink: { color: colors.subscriptionPurple, fontWeight: '700', fontSize: 14 },
  line: { fontSize: 15, color: colors.textSecondary },
  lineMuted: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
  in: {
    backgroundColor: colors.marshland,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    color: colors.textPrimary,
    padding: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15,
  },
  del: { color: colors.danger, fontWeight: '600' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  editName: { fontSize: 15, fontWeight: '700', color: colors.textSecondary },
  hintModal: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  cancel: { color: colors.textMuted, fontSize: 16 },
  ok: { color: colors.accent, fontWeight: '800', fontSize: 16 },
});
