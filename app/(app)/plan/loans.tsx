import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UchumiScreen } from '@/src/components/uchumi-screen';
import { useFormatCurrency } from '@/src/hooks/use-format-currency';
import { useAppStore } from '@/src/store/use-app-store';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

export default function LoansScreen() {
  const insets = useSafeAreaInsets();
  const formatCurrency = useFormatCurrency();
  const loans = useAppStore((s) => s.loans);
  const addLoan = useAppStore((s) => s.addLoan);
  const updateLoan = useAppStore((s) => s.updateLoan);
  const deleteLoan = useAppStore((s) => s.deleteLoan);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [remaining, setRemaining] = useState('');
  const [monthly, setMonthly] = useState('');

  const submit = () => {
    const r = Number(remaining.replace(',', '.'));
    const m = Number(monthly.replace(',', '.'));
    if (!name.trim() || !Number.isFinite(r) || r < 0 || !Number.isFinite(m) || m < 0) {
      Alert.alert('Erreur', 'Remplissez nom, reste dû et mensualité (nombres positifs).');
      return;
    }
    addLoan({
      name: name.trim(),
      remainingAmount: r,
      monthlyPayment: m,
      note: '',
    });
    setName('');
    setRemaining('');
    setMonthly('');
    setOpen(false);
  };

  return (
    <UchumiScreen style={styles.wrap}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 24 },
        ]}>
        <Text style={styles.intro}>
          Suivi manuel (hors banque connectée). Mettez à jour le reste dû quand vous voulez.
        </Text>
        <Pressable
          onPress={() => setOpen(true)}
          style={({ pressed }) => [styles.add, pressed && styles.pressed]}>
          <Ionicons name="add" size={22} color={colors.textPrimary} />
          <Text style={styles.addText}>Ajouter un crédit</Text>
        </Pressable>

        {loans.map((l) => (
          <View key={l.id} style={styles.card}>
            <Text style={styles.loanName}>{l.name}</Text>
            <Text style={styles.line}>
              Reste : {formatCurrency(l.remainingAmount)}
            </Text>
            <Text style={styles.line}>
              Mensualité : {formatCurrency(l.monthlyPayment)}
            </Text>
            <TextInput
              style={styles.in}
              placeholder="Mettre à jour le reste dû"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              defaultValue={String(l.remainingAmount)}
              onEndEditing={(e) => {
                const n = Number(e.nativeEvent.text.replace(',', '.'));
                if (Number.isFinite(n) && n >= 0) updateLoan(l.id, { remainingAmount: n });
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
        ))}
      </ScrollView>

      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.modalBg} onPress={() => setOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
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
              placeholder="Reste dû"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={remaining}
              onChangeText={setRemaining}
            />
            <TextInput
              style={styles.in}
              placeholder="Mensualité"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={monthly}
              onChangeText={setMonthly}
            />
            <View style={styles.modalRow}>
              <Pressable onPress={() => setOpen(false)}>
                <Text style={styles.cancel}>Annuler</Text>
              </Pressable>
              <Pressable onPress={submit}>
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
  loanName: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  line: { fontSize: 15, color: colors.textSecondary },
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
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  cancel: { color: colors.textMuted, fontSize: 16 },
  ok: { color: colors.accent, fontWeight: '800', fontSize: 16 },
});
