import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

import {
  SilkyModalize,
  type ModalizeRef,
} from '@/src/components/silky-modalize';
import { ScreenHeader } from '@/src/components/screen-header';
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
  const goalModalRef = useRef<ModalizeRef>(null);
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
    goalModalRef.current?.close();
  };

  return (
    <UchumiScreen style={styles.wrap}>
      <ScreenHeader title="Objectifs" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 24 },
        ]}>
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={() => goalModalRef.current?.open()}
          style={styles.addTouchable}>
          <LinearGradient
            colors={['#4a6670', '#354248']}
            style={styles.addGrad}>
            <Ionicons name="add" size={22} color={colors.textOnDark} />
            <Text style={styles.addText}>Nouvel objectif</Text>
          </LinearGradient>
        </TouchableOpacity>

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
                <TouchableOpacity
                  activeOpacity={0.75}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  onPress={() =>
                    Alert.alert('Supprimer ?', '', [
                      { text: 'Annuler', style: 'cancel' },
                      {
                        text: 'Supprimer',
                        style: 'destructive',
                        onPress: () => deleteGoal(g.id),
                      },
                    ])
                  }
                  style={styles.iconBtn}>
                  <Ionicons name="trash-outline" size={22} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <SilkyModalize
        ref={goalModalRef}
        adjustToContentHeight
        childrenStyle={styles.modalChildren}
        onClosed={() => {
          setName('');
          setTarget('');
          setSaved('');
        }}
        scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}>
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
        <View style={styles.modalBtnRow}>
          <TouchableOpacity
            activeOpacity={0.75}
            style={styles.modalBtnGhost}
            onPress={() => goalModalRef.current?.close()}>
            <Text style={styles.modalBtnGhostLabel}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.88} style={styles.modalBtnPrimary} onPress={submit}>
            <Text style={styles.modalBtnPrimaryLabel}>Créer</Text>
          </TouchableOpacity>
        </View>
      </SilkyModalize>
    </UchumiScreen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: spacing.sm },
  scroll: { gap: spacing.md },
  addTouchable: { borderRadius: 14, overflow: 'hidden', marginBottom: spacing.sm },
  addGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.md,
  },
  addText: { color: colors.textOnDark, fontWeight: '800', fontSize: 16 },
  card: {
    backgroundColor: colors.dune,
    borderRadius: 16,
    padding: spacing.md + 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    gap: spacing.md,
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
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  miniIn: {
    flex: 1,
    backgroundColor: colors.marshland,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    color: colors.textPrimary,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    paddingHorizontal: spacing.md,
    fontSize: 15,
  },
  iconBtn: {
    padding: spacing.sm,
    borderRadius: 12,
    backgroundColor: 'rgba(232, 93, 76, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(232, 93, 76, 0.2)',
  },
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
