import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const formatCurrency = useFormatCurrency();
  const goals = useAppStore((s) => s.savingsGoals);
  const addGoal = useAppStore((s) => s.addSavingsGoal);
  const updateGoal = useAppStore((s) => s.updateSavingsGoal);
  const deleteGoal = useAppStore((s) => s.deleteSavingsGoal);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [saved, setSaved] = useState('');

  const submit = () => {
    const t = Number(target.replace(',', '.'));
    const s = Number(saved.replace(',', '.'));
    if (!name.trim() || !Number.isFinite(t) || t <= 0) {
      Alert.alert('Champs requis', 'Nom et objectif (montant) valides.');
      return;
    }
    addGoal({
      name: name.trim(),
      targetAmount: t,
      savedAmount: Number.isFinite(s) && s >= 0 ? s : 0,
      targetDate: null,
    });
    setName('');
    setTarget('');
    setSaved('');
    setOpen(false);
  };

  return (
    <UchumiScreen style={styles.wrap}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 24 },
        ]}>
        <Pressable
          onPress={() => setOpen(true)}
          style={({ pressed }) => [styles.add, pressed && styles.pressed]}>
          <LinearGradient
            colors={['#4a6670', '#354248']}
            style={styles.addGrad}>
            <Ionicons name="add" size={22} color={colors.textPrimary} />
            <Text style={styles.addText}>Nouvel objectif</Text>
          </LinearGradient>
        </Pressable>

        {goals.map((g) => {
          const ratio =
            g.targetAmount > 0 ? Math.min(1, g.savedAmount / g.targetAmount) : 0;
          return (
            <View key={g.id} style={styles.card}>
              <Text style={styles.goalName}>{g.name}</Text>
              <Text style={styles.goalAmt}>
                {formatCurrency(g.savedAmount)} / {formatCurrency(g.targetAmount)}
              </Text>
              <View style={styles.track}>
                <LinearGradient
                  colors={[colors.success, '#4a6b5a']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.fill, { width: `${ratio * 100}%` }]}
                />
              </View>
              <View style={styles.actions}>
                <TextInput
                  style={styles.miniIn}
                  placeholder="Ajuster épargné"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="decimal-pad"
                  defaultValue={String(g.savedAmount)}
                  onEndEditing={(e) => {
                    const n = Number(e.nativeEvent.text.replace(',', '.'));
                    if (Number.isFinite(n) && n >= 0) {
                      updateGoal(g.id, { savedAmount: n });
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
                        onPress: () => deleteGoal(g.id),
                      },
                    ])
                  }>
                  <Ionicons name="trash-outline" size={22} color={colors.danger} />
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.modalBg} onPress={() => setOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Nouvel objectif</Text>
            <TextInput
              style={styles.in}
              placeholder="Nom"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.in}
              placeholder="Objectif (montant)"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={target}
              onChangeText={setTarget}
            />
            <TextInput
              style={styles.in}
              placeholder="Déjà épargné (optionnel)"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={saved}
              onChangeText={setSaved}
            />
            <View style={styles.modalRow}>
              <Pressable onPress={() => setOpen(false)}>
                <Text style={styles.cancel}>Annuler</Text>
              </Pressable>
              <Pressable onPress={submit}>
                <Text style={styles.ok}>Créer</Text>
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
  add: { borderRadius: 14, overflow: 'hidden', marginBottom: spacing.sm },
  addGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  addText: { color: colors.textPrimary, fontWeight: '800', fontSize: 16 },
  pressed: { opacity: 0.9 },
  card: {
    backgroundColor: colors.dune,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: spacing.sm,
  },
  goalName: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  goalAmt: { fontSize: 14, color: colors.textSecondary },
  track: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.marshland,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 5 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  miniIn: {
    flex: 1,
    backgroundColor: colors.marshland,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    color: colors.textPrimary,
    padding: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15,
  },
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
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  cancel: { color: colors.textMuted, fontSize: 16 },
  ok: { color: colors.accent, fontWeight: '800', fontSize: 16 },
});
