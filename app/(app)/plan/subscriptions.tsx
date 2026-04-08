import { Ionicons } from '@expo/vector-icons';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SubscriptionCarousel } from '@/src/components/dashboard/subscription-carousel';
import { SubscriptionPresetLogo } from '@/src/components/subscription-preset-logo';
import {
  SilkyModalize,
  type ModalizeRef,
} from '@/src/components/silky-modalize';
import { ScreenHeader } from '@/src/components/screen-header';
import { UchumiScreen } from '@/src/components/uchumi-screen';
import {
  CURRENCY_OPTIONS,
  DEFAULT_CURRENCY,
} from '@/src/constants/currencies';
import {
  PRESET_ORDER,
  SUBSCRIPTION_PRESET_META,
} from '@/src/constants/subscription-presets';
import { daysUntilNextBilling } from '@/src/domain/subscription-dates';
import { formatCurrency } from '@/src/lib/format-currency';
import { useAppStore } from '@/src/store/use-app-store';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';
import type { Subscription, SubscriptionPreset } from '@/src/types/subscription';

const baseForm = (): Omit<Subscription, 'id'> => ({
  name: '',
  amount: 0,
  currencyId: DEFAULT_CURRENCY,
  billingDayOfMonth: 5,
  preset: 'custom',
  isMonthlyRecurring: true,
  categoryId: null,
  remindDaysBefore: 2,
  autoRecordExpense: false,
  lastAutoRecordedMonth: null,
  isActive: true,
  notes: '',
});

export default function SubscriptionsScreen() {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const subscriptionModalRef = useRef<ModalizeRef>(null);
  const defaultCurrency = useAppStore((s) => s.currency);
  const subscriptions = useAppStore((s) => s.subscriptions);
  const categories = useAppStore((s) => s.categories);
  const addSubscription = useAppStore((s) => s.addSubscription);
  const updateSubscription = useAppStore((s) => s.updateSubscription);
  const deleteSubscription = useAppStore((s) => s.deleteSubscription);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Subscription, 'id'>>(baseForm());

  const openNew = useCallback(() => {
    setEditingId(null);
    setForm({ ...baseForm(), currencyId: defaultCurrency });
    subscriptionModalRef.current?.open();
  }, [defaultCurrency]);

  const openEdit = useCallback((s: Subscription) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      amount: s.amount,
      currencyId: s.currencyId,
      billingDayOfMonth: s.billingDayOfMonth,
      preset: s.preset,
      isMonthlyRecurring: s.isMonthlyRecurring,
      categoryId: s.categoryId,
      remindDaysBefore: s.remindDaysBefore,
      autoRecordExpense: s.autoRecordExpense,
      lastAutoRecordedMonth: s.lastAutoRecordedMonth,
      isActive: s.isActive,
      notes: s.notes,
    });
    subscriptionModalRef.current?.open();
  }, []);

  const setPreset = (p: SubscriptionPreset) => {
    setForm((f) => {
      const meta = SUBSCRIPTION_PRESET_META[p];
      const name = !f.name.trim() ? meta.label : f.name;
      return { ...f, preset: p, name };
    });
  };

  const submit = () => {
    const name = form.name.trim();
    const amt = form.amount;
    const day = form.billingDayOfMonth;
    if (!name || !Number.isFinite(amt) || amt <= 0) {
      Alert.alert('Erreur', 'Indiquez un nom et un montant valide.');
      return;
    }
    if (form.isMonthlyRecurring) {
      if (!Number.isFinite(day) || day < 1 || day > 28) {
        Alert.alert('Erreur', 'Le jour de prélèvement doit être entre 1 et 28.');
        return;
      }
    }
    const payload: Omit<Subscription, 'id'> = {
      ...form,
      name,
      amount: amt,
      billingDayOfMonth: form.isMonthlyRecurring
        ? Math.round(day)
        : Math.min(28, Math.max(1, Math.round(day) || 1)),
      autoRecordExpense: form.isMonthlyRecurring ? form.autoRecordExpense : false,
      remindDaysBefore: form.isMonthlyRecurring ? form.remindDaysBefore : 0,
    };
    if (editingId) {
      updateSubscription(editingId, payload);
    } else {
      addSubscription({
        ...payload,
        lastAutoRecordedMonth: null,
      });
    }
    subscriptionModalRef.current?.close();
  };

  return (
    <UchumiScreen style={styles.wrap}>
      <ScreenHeader title="Abonnements & fixes" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 24 },
        ]}>
        <Text style={styles.intro}>
          Choisissez un type (logo chargé depuis Internet), le montant et sa devise, puis indiquez si
          la charge est rechargeable chaque mois et le jour de prélèvement. Aucune photo à ajouter.
        </Text>
        <Pressable
          onPress={openNew}
          style={({ pressed }) => [styles.add, pressed && styles.pressed]}>
          <Ionicons name="add" size={22} color={colors.textPrimary} />
          <Text style={styles.addText}>Ajouter une charge</Text>
        </Pressable>

        {subscriptions.length > 0 ? (
          <SubscriptionCarousel
            subscriptions={subscriptions}
            onPressSubscription={openEdit}
          />
        ) : null}

        {subscriptions.length > 0 ? (
          <Text style={styles.listSectionTitle}>Toutes les charges</Text>
        ) : null}

        {subscriptions.length === 0 ? (
          <Text style={styles.empty}>Aucune charge enregistrée.</Text>
        ) : (
          subscriptions.map((s) => {
            const days = s.isMonthlyRecurring
              ? daysUntilNextBilling(s.billingDayOfMonth)
              : null;
            return (
              <Pressable
                key={s.id}
                onPress={() => openEdit(s)}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
                <View style={styles.cardRow}>
                  <SubscriptionPresetLogo preset={s.preset} size={52} />
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{s.name}</Text>
                    <Text style={styles.cardLine}>
                      {formatCurrency(s.amount, s.currencyId)}
                      {s.isMonthlyRecurring ? (
                        <> · jour {s.billingDayOfMonth}</>
                      ) : (
                        <> · ponctuel</>
                      )}
                    </Text>
                    <Text style={styles.cardHint}>
                      {!s.isActive
                        ? 'Inactif'
                        : !s.isMonthlyRecurring
                          ? 'Non inclus dans la charge mensuelle prévue'
                          : days === 0
                            ? 'Échéance aujourd’hui'
                            : `Prochaine échéance dans ${days} jour(s)`}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      <SilkyModalize
        ref={subscriptionModalRef}
        modalHeight={Math.round(windowHeight * 0.92)}
        scrollViewProps={{
          keyboardShouldPersistTaps: 'handled',
          showsVerticalScrollIndicator: false,
        }}
        childrenStyle={{ paddingBottom: spacing.xl * 1.5 }}>
        <Text style={styles.modalTitle}>
          {editingId ? 'Modifier' : 'Nouvelle charge'}
        </Text>

              <Text style={styles.label}>Type</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.presetRow}>
                {PRESET_ORDER.map((p: SubscriptionPreset) => {
                  const m = SUBSCRIPTION_PRESET_META[p];
                  const sel = form.preset === p;
                  return (
                    <Pressable
                      key={p}
                      onPress={() => setPreset(p)}
                      style={[
                        styles.presetChip,
                        sel && { borderColor: m.accent, backgroundColor: m.accent + '22' },
                      ]}>
                      <SubscriptionPresetLogo preset={p} size={36} />
                      <Text
                        style={[styles.presetLabel, sel && { color: colors.textPrimary }]}
                        numberOfLines={2}>
                        {m.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.in}
                placeholder="Ou laissez le nom du type"
                placeholderTextColor={colors.textMuted}
                value={form.name}
                onChangeText={(name) => setForm((f) => ({ ...f, name }))}
              />

              <Text style={styles.label}>Devise du montant</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.curRow}>
                {CURRENCY_OPTIONS.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => setForm((f) => ({ ...f, currencyId: c.id }))}
                    style={[
                      styles.curChip,
                      form.currencyId === c.id && styles.curChipOn,
                    ]}>
                    <Text style={styles.curChipText} numberOfLines={1}>
                      {c.icon} {c.label.split('—')[0].trim()}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={styles.label}>Montant</Text>
              <TextInput
                style={styles.in}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
                value={form.amount > 0 ? String(form.amount) : ''}
                onChangeText={(t) => {
                  const n = Number(t.replace(',', '.'));
                  setForm((f) => ({
                    ...f,
                    amount: Number.isFinite(n) ? Math.max(0, n) : 0,
                  }));
                }}
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Rechargeable chaque mois</Text>
                <Switch
                  value={form.isMonthlyRecurring}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      isMonthlyRecurring: v,
                      autoRecordExpense: v ? f.autoRecordExpense : false,
                      remindDaysBefore: v ? f.remindDaysBefore : 0,
                    }))
                  }
                  trackColor={{ false: colors.fuscousGray, true: colors.accent + '88' }}
                />
              </View>

              {form.isMonthlyRecurring ? (
                <>
                  <Text style={styles.label}>Jour de recharge / prélèvement (1–28)</Text>
                  <TextInput
                    style={styles.in}
                    placeholder="5"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    value={
                      form.billingDayOfMonth
                        ? String(form.billingDayOfMonth)
                        : ''
                    }
                    onChangeText={(t) => {
                      const n = parseInt(t, 10);
                      setForm((f) => ({
                        ...f,
                        billingDayOfMonth: Number.isFinite(n) ? n : 1,
                      }));
                    }}
                  />

                  <Text style={styles.label}>Rappel (jours avant)</Text>
                  <TextInput
                    style={styles.in}
                    placeholder="2"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    value={String(form.remindDaysBefore)}
                    onChangeText={(t) => {
                      const n = parseInt(t, 10);
                      setForm((f) => ({
                        ...f,
                        remindDaysBefore: Number.isFinite(n)
                          ? Math.max(0, Math.min(28, n))
                          : 0,
                      }));
                    }}
                  />

                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Enregistrer une dépense le jour J</Text>
                    <Switch
                      value={form.autoRecordExpense}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, autoRecordExpense: v }))
                      }
                      trackColor={{ false: colors.fuscousGray, true: colors.accent + '88' }}
                    />
                  </View>
                  <Text style={styles.hint}>
                    Au lancement de l’app le jour du prélèvement, une dépense peut être créée (une fois
                    par mois), dans la devise de l’abonnement.
                  </Text>
                </>
              ) : (
                <Text style={styles.hint}>
                  Charge ponctuelle : pas de rappel mensuel ni d’enregistrement auto. Non incluse dans
                  la prévision « charges fixes » mensuelle.
                </Text>
              )}

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Actif</Text>
                <Switch
                  value={form.isActive}
                  onValueChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                  trackColor={{ false: colors.fuscousGray, true: colors.accent + '88' }}
                />
              </View>

              <Text style={styles.label}>Catégorie (optionnel)</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.catRow}>
                <Pressable
                  onPress={() => setForm((f) => ({ ...f, categoryId: null }))}
                  style={[
                    styles.catChip,
                    form.categoryId === null && styles.catChipOn,
                  ]}>
                  <Text style={styles.catChipText}>Aucune</Text>
                </Pressable>
                {categories.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => setForm((f) => ({ ...f, categoryId: c.id }))}
                    style={[
                      styles.catChip,
                      form.categoryId === c.id && styles.catChipOn,
                    ]}>
                    <Text style={styles.catChipText} numberOfLines={1}>
                      {c.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

        <View style={styles.modalRow}>
          <TouchableOpacity
            activeOpacity={0.88}
            style={styles.modalBtnGhost}
            onPress={() => subscriptionModalRef.current?.close()}>
            <Text style={styles.cancel}>Annuler</Text>
          </TouchableOpacity>
          {editingId ? (
            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.modalBtnDanger}
              onPress={() =>
                Alert.alert('Supprimer ?', '', [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: () => {
                      deleteSubscription(editingId);
                      subscriptionModalRef.current?.close();
                    },
                  },
                ])
              }>
              <Text style={styles.danger}>Supprimer</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity activeOpacity={0.88} style={styles.modalBtnPrimary} onPress={submit}>
            <Text style={styles.ok}>{editingId ? 'Enregistrer' : 'Ajouter'}</Text>
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
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  addText: { color: colors.textPrimary, fontWeight: '800', fontSize: 16 },
  listSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  pressed: { opacity: 0.88 },
  empty: { color: colors.textMuted, fontSize: 14 },
  card: {
    backgroundColor: colors.dune,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary },
  cardLine: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  cardHint: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 6,
    marginTop: 4,
  },
  in: {
    backgroundColor: colors.marshland,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    color: colors.textPrimary,
    padding: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15,
  },
  presetRow: { gap: 10, paddingVertical: 4 },
  presetChip: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    width: 108,
  },
  presetLabel: { fontSize: 10, color: colors.textMuted, textAlign: 'center' },
  curRow: { gap: 8, paddingVertical: 4 },
  curChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    backgroundColor: colors.marshland,
    maxWidth: 140,
  },
  curChipOn: { borderColor: colors.accent, backgroundColor: colors.accent + '22' },
  curChipText: { color: colors.textSecondary, fontSize: 12 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  switchLabel: { color: colors.textPrimary, fontSize: 15, flex: 1, paddingRight: 12 },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
    lineHeight: 17,
  },
  catRow: { gap: 8, paddingVertical: 4 },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    backgroundColor: colors.marshland,
  },
  catChipOn: { borderColor: colors.accent, backgroundColor: colors.accent + '22' },
  catChipText: { color: colors.textSecondary, fontSize: 13, maxWidth: 120 },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.lg,
    flexWrap: 'wrap',
  },
  modalBtnGhost: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    backgroundColor: colors.marshland,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  modalBtnDanger: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    backgroundColor: 'rgba(232, 93, 76, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(232, 93, 76, 0.35)',
  },
  modalBtnPrimary: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md + 2,
    borderRadius: 999,
    backgroundColor: colors.accent + '22',
    borderWidth: 1,
    borderColor: colors.accent + '66',
  },
  cancel: { color: colors.textMuted, fontSize: 16 },
  ok: { color: colors.accent, fontWeight: '800', fontSize: 16 },
  danger: { color: colors.danger, fontWeight: '700', fontSize: 16 },
});
