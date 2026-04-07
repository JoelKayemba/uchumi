import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UchumiScreen } from '@/src/components/uchumi-screen';
import {
  CURRENCY_OPTIONS,
  type CurrencyOptionId,
} from '@/src/constants/currencies';
import { exportUchumiCsv } from '@/src/services/export-csv';
import { exportUchumiData } from '@/src/services/export-data';
import { pickAndImportUchumiJson } from '@/src/services/import-data';
import { useAppStore } from '@/src/store/use-app-store';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const appMode = useAppStore((s) => s.appMode);
  const currency = useAppStore((s) => s.currency);
  const setCurrency = useAppStore((s) => s.setCurrency);
  const resetOnboarding = useAppStore((s) => s.resetOnboarding);
  const reminderEnabled = useAppStore((s) => s.reminderEnabled);
  const reminderHour = useAppStore((s) => s.reminderHour);
  const reminderMinute = useAppStore((s) => s.reminderMinute);
  const setReminderPreferences = useAppStore((s) => s.setReminderPreferences);
  const lowBalanceEnabled = useAppStore((s) => s.lowBalanceEnabled);
  const lowBalanceThreshold = useAppStore((s) => s.lowBalanceThreshold);
  const setLowBalancePreferences = useAppStore((s) => s.setLowBalancePreferences);
  const appLockEnabled = useAppStore((s) => s.appLockEnabled);
  const setAppLockEnabled = useAppStore((s) => s.setAppLockEnabled);

  const [currencyModal, setCurrencyModal] = useState(false);
  const [thresholdDraft, setThresholdDraft] = useState(
    () => (lowBalanceThreshold != null ? String(lowBalanceThreshold) : '')
  );

  useEffect(() => {
    if (lowBalanceThreshold != null) {
      setThresholdDraft(String(lowBalanceThreshold));
    }
  }, [lowBalanceThreshold]);
  const [exporting, setExporting] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const currencyLabel =
    CURRENCY_OPTIONS.find((o) => o.id === currency)?.label ?? '';

  const timeLabel = useMemo(
    () =>
      `${String(reminderHour).padStart(2, '0')}:${String(reminderMinute).padStart(2, '0')}`,
    [reminderHour, reminderMinute]
  );

  const reminderDate = useMemo(() => {
    const d = new Date();
    d.setHours(reminderHour, reminderMinute, 0, 0);
    return d;
  }, [reminderHour, reminderMinute]);

  const replayOnboarding = () => {
    resetOnboarding();
    router.replace('/welcome');
  };

  const runExport = async () => {
    setExporting(true);
    try {
      await exportUchumiData();
    } finally {
      setExporting(false);
    }
  };

  const runExportCsv = async () => {
    setExportingCsv(true);
    try {
      await exportUchumiCsv();
    } finally {
      setExportingCsv(false);
    }
  };

  const runImport = async () => {
    setImporting(true);
    try {
      await pickAndImportUchumiJson();
    } finally {
      setImporting(false);
    }
  };

  const pickCurrency = (id: CurrencyOptionId) => {
    setCurrency(id);
    setCurrencyModal(false);
  };

  const onTimeChange = (_e: unknown, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (date) {
      setReminderPreferences(reminderEnabled, date.getHours(), date.getMinutes());
    }
  };

  return (
    <UchumiScreen style={styles.outer}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + 88 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#353a42', '#22262c']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="options" size={28} color={colors.textPrimary} />
          </View>
          <Text style={styles.title}>Réglages</Text>
          <Text style={styles.heroSub}>
            Devise, rappels, alertes, export / import et onboarding.
          </Text>
        </LinearGradient>

        <View style={styles.row}>
          <Text style={styles.label}>Mode actuel</Text>
          <Text style={styles.value}>{appMode === 'business' ? 'Activité' : 'Personnel'}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.row, styles.rowPress, pressed && styles.pressed]}
          onPress={() => setCurrencyModal(true)}>
          <Text style={styles.label}>Devise d’affichage</Text>
          <Text style={styles.valueChevron} numberOfLines={2}>
            {currencyLabel} ›
          </Text>
        </Pressable>

        <View style={styles.reminderBlock}>
          <View style={styles.reminderRow}>
            <View style={styles.reminderTextCol}>
              <Text style={styles.reminderTitle}>Rappel quotidien</Text>
              <Text style={styles.reminderSub}>
                Chaque jour à l’heure choisie : rappel pour enregistrer un mouvement. Notification
                locale uniquement (aucun serveur).
              </Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={(v) => setReminderPreferences(v)}
              trackColor={{ false: colors.fuscousGray, true: colors.accent }}
              thumbColor={colors.textPrimary}
            />
          </View>
          {reminderEnabled ? (
            <Pressable
              style={({ pressed }) => [styles.timeBtn, pressed && styles.pressed]}
              onPress={() => setShowTimePicker(true)}>
              <Text style={styles.timeBtnLabel}>Heure : {timeLabel}</Text>
              <Text style={styles.timeBtnHint}>Toucher pour modifier</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.reminderBlock}>
          <View style={styles.reminderRow}>
            <View style={styles.reminderTextCol}>
              <Text style={styles.reminderTitle}>Alerte fond faible</Text>
              <Text style={styles.reminderSub}>
                Notification si le solde disponible (devise d’affichage) passe sous le seuil. Au plus
                une fois par jour. Les notifications doivent être autorisées.
              </Text>
            </View>
            <Switch
              value={lowBalanceEnabled}
              onValueChange={(v) => {
                if (v) {
                  const n = Number(thresholdDraft.replace(',', '.').trim());
                  if (!Number.isFinite(n) || n <= 0) {
                    Alert.alert(
                      'Seuil requis',
                      'Saisissez un montant positif dans le champ ci-dessous (même unité que la devise d’affichage), puis réactivez l’alerte.'
                    );
                    return;
                  }
                  setLowBalancePreferences(true, n);
                } else {
                  setLowBalancePreferences(false, null);
                }
              }}
              trackColor={{ false: colors.fuscousGray, true: colors.accent }}
              thumbColor={colors.textPrimary}
            />
          </View>
          <TextInput
            style={styles.thresholdInput}
            placeholder="Seuil (ex. 50 000)"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
            value={thresholdDraft}
            onChangeText={setThresholdDraft}
            onBlur={() => {
              const n = Number(thresholdDraft.replace(',', '.').trim());
              if (!lowBalanceEnabled) return;
              if (Number.isFinite(n) && n > 0) {
                setLowBalancePreferences(true, n);
              }
            }}
          />
        </View>

        <View style={styles.reminderBlock}>
          <View style={styles.reminderRow}>
            <View style={styles.reminderTextCol}>
              <Text style={styles.reminderTitle}>Verrouillage à l’ouverture</Text>
              <Text style={styles.reminderSub}>
                Après retour depuis une autre app ou l’écran verrouillé, authentification locale
                (code, Face ID ou empreinte) pour revenir à UCHUMI.
              </Text>
            </View>
            <Switch
              value={appLockEnabled}
              onValueChange={setAppLockEnabled}
              trackColor={{ false: colors.fuscousGray, true: colors.accent }}
              thumbColor={colors.textPrimary}
            />
          </View>
        </View>

        {showTimePicker && Platform.OS === 'android' ? (
          <DateTimePicker
            value={reminderDate}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        ) : null}

        {showTimePicker && Platform.OS === 'ios' ? (
          <Modal
            visible
            transparent
            animationType="fade"
            onRequestClose={() => setShowTimePicker(false)}>
            <View style={styles.timeModalOverlay}>
              <View style={styles.timeModalCard}>
                <DateTimePicker
                  value={reminderDate}
                  mode="time"
                  display="spinner"
                  onChange={onTimeChange}
                  themeVariant="dark"
                />
                <Pressable
                  style={styles.timeModalOk}
                  onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.timeModalOkText}>OK</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
          onPress={() => router.push('/categories')}>
          <Text style={styles.linkLabel}>Gérer les catégories</Text>
        </Pressable>

        <Text style={styles.sectionLabel}>Sauvegarde</Text>
        <Pressable
          style={({ pressed }) => [
            styles.exportBtn,
            exporting && styles.exportDisabled,
            pressed && !exporting && styles.pressed,
          ]}
          onPress={runExport}
          disabled={exporting}>
          {exporting ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Text style={styles.exportLabel}>Exporter mes données (JSON)</Text>
          )}
        </Pressable>
        <Text style={styles.exportHint}>
          Fichier partageable (mail, Drive, etc.). Aucune donnée n’est envoyée sur un serveur
          UCHUMI.
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.exportBtn,
            exportingCsv && styles.exportDisabled,
            pressed && !exportingCsv && styles.pressed,
          ]}
          onPress={runExportCsv}
          disabled={exportingCsv}>
          {exportingCsv ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Text style={styles.exportLabel}>Exporter les mouvements (CSV)</Text>
          )}
        </Pressable>
        <Text style={styles.exportHint}>
          Pour tableur : libellés, montants, tags, notes. Tout reste sur l’appareil.
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.exportBtn,
            importing && styles.exportDisabled,
            pressed && !importing && styles.pressed,
          ]}
          onPress={runImport}
          disabled={importing}>
          {importing ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Text style={styles.exportLabel}>Importer un fichier (JSON)</Text>
          )}
        </Pressable>
        <Text style={styles.exportHint}>
          Remplace vos catégories et mouvements par un export UCHUMI valide. Pensez à exporter
          avant si vous voulez garder une copie de l’état actuel.
        </Text>

        <Pressable
          style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
          onPress={replayOnboarding}>
          <Text style={styles.linkLabel}>Revoir l’introduction (onboarding)</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={currencyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setCurrencyModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setCurrencyModal(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Devise d’affichage</Text>
            <Text style={styles.modalSub}>
              Utilisée pour formater les montants dans l’app (symbole ou code ISO).
            </Text>
            {CURRENCY_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                onPress={() => pickCurrency(opt.id)}
                style={[
                  styles.currencyRow,
                  currency === opt.id && styles.currencyRowActive,
                ]}>
                <Text
                  style={[
                    styles.currencyText,
                    currency === opt.id && styles.currencyTextActive,
                  ]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
            <Pressable
              onPress={() => setCurrencyModal(false)}
              style={({ pressed }) => [styles.modalClose, pressed && styles.pressed]}>
              <Text style={styles.modalCloseText}>Fermer</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </UchumiScreen>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  container: {
    gap: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  hero: {
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  heroSub: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(244,241,238,0.65)',
    marginTop: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.fuscousGray,
    gap: spacing.md,
  },
  rowPress: {
    alignItems: 'flex-start',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 16,
    flexShrink: 0,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  valueChevron: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  reminderBlock: {
    backgroundColor: colors.dune,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    gap: spacing.sm,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  reminderTextCol: {
    flex: 1,
  },
  reminderTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  reminderSub: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  timeBtn: {
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.fuscousGray,
  },
  timeBtnLabel: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  timeBtnHint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  thresholdInput: {
    marginTop: spacing.sm,
    backgroundColor: colors.marshland,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    color: colors.textPrimary,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  timeModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: spacing.lg,
  },
  timeModalCard: {
    backgroundColor: colors.dune,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  timeModalOk: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  timeModalOkText: {
    color: colors.accent,
    fontSize: 17,
    fontWeight: '700',
  },
  linkButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  linkLabel: {
    color: colors.accent,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  exportBtn: {
    backgroundColor: colors.dune,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    marginTop: spacing.xs,
  },
  exportDisabled: {
    opacity: 0.6,
  },
  exportLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  exportHint: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: -spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.dune,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    maxHeight: '80%',
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  modalSub: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  currencyRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  currencyRowActive: {
    backgroundColor: colors.fuscousGray,
    borderColor: colors.accent,
  },
  currencyText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  currencyTextActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  modalClose: {
    marginTop: spacing.md,
    alignSelf: 'center',
    padding: spacing.sm,
  },
  modalCloseText: {
    color: colors.textMuted,
    fontSize: 16,
  },
});
