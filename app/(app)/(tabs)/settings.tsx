import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AdBannerSlot } from '@/src/components/ad-banner-slot';
import {
  SilkyModalize,
  type ModalizeRef,
} from '@/src/components/silky-modalize';
import { UchumiScreen } from '@/src/components/uchumi-screen';
import {
  currencyOptionIcon,
  currencyOptionLabel,
  groupCurrenciesForSettings,
  getSortedCurrencyOptions,
  type CurrencyOptionId,
} from '@/src/constants/currencies';
import { exportUchumiCsv } from '@/src/services/export-csv';
import { exportUchumiData } from '@/src/services/export-data';
import { pickAndImportUchumiJson } from '@/src/services/import-data';
import {
  getNotificationAuthStatus,
  openAppSettingsForNotifications,
  requestNotificationPermissions,
  type NotificationAuthStatus,
} from '@/src/services/notification-permissions';
import {
  syncReminderFromStore,
} from '@/src/services/reminder-notifications';
import { syncSubscriptionNotificationsFromStore } from '@/src/services/subscription-sync';
import { syncWeeklySummaryFromStore } from '@/src/services/weekly-summary-notifications';
import { useAppStore } from '@/src/store/use-app-store';
import { colors, TAB_BAR_FLOAT_BOTTOM_OFFSET } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

function titleFromCurrencyLabel(label: string): string {
  const i = label.indexOf(' — ');
  return i >= 0 ? label.slice(0, i) : label;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const currencyModalRef = useRef<ModalizeRef>(null);
  const timeModalRef = useRef<ModalizeRef>(null);
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
  const weeklySummaryEnabled = useAppStore((s) => s.weeklySummaryEnabled);
  const setWeeklySummaryPreferences = useAppStore(
    (s) => s.setWeeklySummaryPreferences
  );
  const clearTransactions = useAppStore((s) => s.clearTransactions);
  const clearCategoryBudgets = useAppStore((s) => s.clearCategoryBudgets);
  const clearSavingsGoals = useAppStore((s) => s.clearSavingsGoals);
  const clearRecurringRules = useAppStore((s) => s.clearRecurringRules);
  const clearLoans = useAppStore((s) => s.clearLoans);
  const clearSubscriptions = useAppStore((s) => s.clearSubscriptions);
  const clearMarketWatchlist = useAppStore((s) => s.clearMarketWatchlist);
  const clearNotificationLog = useAppStore((s) => s.clearNotificationLog);
  const purgeAllFinancialData = useAppStore((s) => s.purgeAllFinancialData);

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
  const [currencyQuery, setCurrencyQuery] = useState('');
  const [notifAuth, setNotifAuth] = useState<NotificationAuthStatus | null>(null);

  const refreshNotifAuth = useCallback(() => {
    void getNotificationAuthStatus().then(setNotifAuth);
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'web') {
        setNotifAuth(null);
        return;
      }
      refreshNotifAuth();
    }, [refreshNotifAuth])
  );

  const currencyLabel = currencyOptionLabel(currency);
  const currencyEmoji = currencyOptionIcon(currency);

  const currencySections = useMemo(() => {
    const sorted = getSortedCurrencyOptions();
    const q = currencyQuery.trim().toLowerCase();
    const stripAccents = (s: string) =>
      s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const needle = stripAccents(q);
    const filtered = !needle
      ? [...sorted]
      : sorted.filter((o) => {
          const label = stripAccents(o.label.toLowerCase());
          return (
            label.includes(needle) ||
            o.iso4217.toLowerCase().includes(q) ||
            o.id.toLowerCase().includes(q)
          );
        });
    if (!needle) {
      return groupCurrenciesForSettings(filtered);
    }
    return [{ title: 'Résultats', items: filtered }];
  }, [currencyQuery]);

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
    setCurrencyQuery('');
    currencyModalRef.current?.close();
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
          { paddingBottom: insets.bottom + TAB_BAR_FLOAT_BOTTOM_OFFSET },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="options" size={28} color={colors.ink} />
          </View>
          <Text style={styles.title}>Réglages</Text>
          <Text style={styles.heroSub}>
            Devise, rappels, alertes, export / import et onboarding.
          </Text>
        </View>

        {Platform.OS !== 'web' ? (
          <View style={styles.notifBlock}>
            <Text style={styles.notifTitle}>Notifications système</Text>
            <Text style={styles.notifSub}>
              Les rappels et alertes UCHUMI sont des notifications locales : elles peuvent
              s’afficher même quand l’app est fermée (aucun serveur, pas de compte).
            </Text>
            <Text style={styles.notifStatus}>
              État :{' '}
              <Text style={styles.notifStatusEm}>
                {notifAuth === null
                  ? '…'
                  : notifAuth === 'granted'
                    ? 'Autorisées'
                    : notifAuth === 'denied'
                      ? 'Refusées'
                      : 'Pas encore demandées'}
              </Text>
            </Text>
            <View style={styles.notifActions}>
              {notifAuth !== 'granted' ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.notifBtnPrimary,
                    pressed && styles.pressed,
                  ]}
                  onPress={async () => {
                    const s = await requestNotificationPermissions();
                    setNotifAuth(s);
                    if (s === 'granted') {
                      await syncReminderFromStore();
                      await syncWeeklySummaryFromStore();
                      await syncSubscriptionNotificationsFromStore();
                    }
                  }}>
                  <Text style={styles.notifBtnPrimaryText}>
                    {notifAuth === 'denied'
                      ? 'Redemander l’autorisation'
                      : 'Autoriser les notifications'}
                  </Text>
                </Pressable>
              ) : null}
              {notifAuth === 'denied' ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.notifBtnSecondary,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => void openAppSettingsForNotifications()}>
                  <Text style={styles.notifBtnSecondaryText}>
                    Ouvrir les réglages du téléphone
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={styles.row}>
          <Text style={styles.label}>Mode actuel</Text>
          <Text style={styles.value}>{appMode === 'business' ? 'Activité' : 'Personnel'}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.row, styles.rowPress, pressed && styles.pressed]}
          onPress={() => {
            setCurrencyQuery('');
            currencyModalRef.current?.open();
          }}>
          <Text style={styles.label}>Devise d’affichage</Text>
          <Text style={styles.valueChevron} numberOfLines={2}>
            {currencyEmoji} {currencyLabel} ›
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
              onPress={() => {
                if (Platform.OS === 'android') {
                  setShowTimePicker(true);
                } else {
                  timeModalRef.current?.open();
                }
              }}>
              <Text style={styles.timeBtnLabel}>Heure : {timeLabel}</Text>
              <Text style={styles.timeBtnHint}>Toucher pour modifier</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.reminderBlock}>
          <View style={styles.reminderRow}>
            <View style={styles.reminderTextCol}>
              <Text style={styles.reminderTitle}>Résumé de fin de semaine</Text>
              <Text style={styles.reminderSub}>
                Chaque samedi à 19 h : rappel pour ouvrir UCHUMI et voir le résumé des dépenses
                (calcul sur l’appareil, sans serveur). Le texte de la notification est fixe ; le détail
                est sur l’accueil.
              </Text>
            </View>
            <Switch
              value={weeklySummaryEnabled}
              onValueChange={(v) => setWeeklySummaryPreferences(v, 7, 19, 0)}
              trackColor={{ false: colors.fuscousGray, true: colors.accent }}
              thumbColor={colors.textPrimary}
            />
          </View>
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

        {showTimePicker && Platform.OS === 'android' ? (
          <DateTimePicker
            value={reminderDate}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
          onPress={() => router.push('/categories')}>
          <Text style={styles.linkLabel}>Gérer les catégories</Text>
        </Pressable>

        <Text style={styles.sectionLabel}>Aide & confidentialité</Text>
        <Pressable
          style={({ pressed }) => [styles.row, styles.rowPress, pressed && styles.pressed]}
          onPress={() => router.push('/notifications')}>
          <Text style={styles.label}>Centre de notifications</Text>
          <Text style={styles.valueChevron}>Voir ›</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.row, styles.rowPress, pressed && styles.pressed]}
          onPress={() => router.push('/support')}>
          <Text style={styles.label}>FAQ & support</Text>
          <Text style={styles.valueChevron}>›</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.row, styles.rowPress, pressed && styles.pressed]}
          onPress={() => router.push('/privacy')}>
          <Text style={styles.label}>Politique de confidentialité</Text>
          <Text style={styles.valueChevron}>›</Text>
        </Pressable>

        <View style={styles.dataBlock}>
          <Text style={styles.reminderTitle}>Données locales (libérer l’espace)</Text>
          <Text style={styles.reminderSub}>
            Tout reste sur cet appareil. Supprimez ce que vous n’utilisez plus — devise et rappels ne
            sont pas effacés sauf réinitialisation complète listée en bas.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.dataBtn, pressed && styles.pressed]}
            onPress={() =>
              Alert.alert(
                'Supprimer tous les mouvements ?',
                'Les soldes et statistiques seront recalculés à partir de zéro.',
                [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: () => clearTransactions(),
                  },
                ]
              )
            }>
            <Text style={styles.dataBtnLabel}>Supprimer tous les mouvements</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.dataBtn, pressed && styles.pressed]}
            onPress={() =>
              Alert.alert(
                'Réinitialiser les budgets par catégorie ?',
                '',
                [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'OK', onPress: () => clearCategoryBudgets() },
                ]
              )
            }>
            <Text style={styles.dataBtnLabel}>Effacer les plafonds de budget</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.dataBtn, pressed && styles.pressed]}
            onPress={() =>
              Alert.alert('Supprimer tous les objectifs d’épargne ?', '', [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Supprimer', style: 'destructive', onPress: () => clearSavingsGoals() },
              ])
            }>
            <Text style={styles.dataBtnLabel}>Supprimer les objectifs</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.dataBtn, pressed && styles.pressed]}
            onPress={() =>
              Alert.alert('Supprimer toutes les récurrences ?', '', [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Supprimer', style: 'destructive', onPress: () => clearRecurringRules() },
              ])
            }>
            <Text style={styles.dataBtnLabel}>Supprimer les récurrences</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.dataBtn, pressed && styles.pressed]}
            onPress={() =>
              Alert.alert('Supprimer tous les prêts ?', '', [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Supprimer', style: 'destructive', onPress: () => clearLoans() },
              ])
            }>
            <Text style={styles.dataBtnLabel}>Supprimer les prêts</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.dataBtn, pressed && styles.pressed]}
            onPress={() =>
              Alert.alert('Supprimer tous les abonnements ?', '', [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Supprimer', style: 'destructive', onPress: () => clearSubscriptions() },
              ])
            }>
            <Text style={styles.dataBtnLabel}>Supprimer les abonnements</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.dataBtn, pressed && styles.pressed]}
            onPress={() =>
              Alert.alert(
                'Réinitialiser la liste marché (AAPL, MSFT par défaut) ?',
                '',
                [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'OK', onPress: () => clearMarketWatchlist() },
                ]
              )
            }>
            <Text style={styles.dataBtnLabel}>Réinitialiser la liste marché</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.dataBtn, pressed && styles.pressed]}
            onPress={() =>
              Alert.alert('Effacer le journal des notifications ?', '', [
                { text: 'Annuler', style: 'cancel' },
                { text: 'OK', onPress: () => clearNotificationLog() },
              ])
            }>
            <Text style={styles.dataBtnLabel}>Effacer le journal des notifications</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.dataBtnDanger, pressed && styles.pressed]}
            onPress={() =>
              Alert.alert(
                'Tout réinitialiser ?',
                'Mouvements, catégories par défaut, budgets, objectifs, récurrences, prêts, abonnements, liste marché et journal de notifications seront effacés. Vos réglages (devise, rappels) sont conservés.',
                [
                  { text: 'Annuler', style: 'cancel' },
                  {
                    text: 'Tout effacer',
                    style: 'destructive',
                    onPress: () => purgeAllFinancialData(),
                  },
                ]
              )
            }>
            <Text style={styles.dataBtnDangerLabel}>Réinitialiser toutes les données financières</Text>
          </Pressable>
        </View>

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

        <AdBannerSlot placeholderDetail="Réglages — emplacement réservé (AdMob en build natif)." />
      </ScrollView>

      <SilkyModalize
        ref={currencyModalRef}
        modalHeight={Math.round(windowHeight * 0.55)}
        scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}>
        <Text style={styles.modalTitle}>Devise d’affichage</Text>
        <Text style={styles.modalSub}>
          Tous les montants de l’interface utilisent cette devise (symbole ou code ISO).
        </Text>
        <View style={styles.currencySearchWrap}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.currencySearchInput}
            placeholder="Rechercher (nom, code ISO…)"
            placeholderTextColor={colors.textMuted}
            value={currencyQuery}
            onChangeText={setCurrencyQuery}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
        </View>
        {currencySections.every((s) => s.items.length === 0) ? (
          <Text style={styles.currencyEmpty}>
            Aucune devise ne correspond à « {currencyQuery.trim()} ». Essayez un autre mot ou un
            code ISO (ex. CAD, EUR).
          </Text>
        ) : null}
        {currencySections.map((section) => (
          <View key={section.title} style={styles.currencySection}>
            {section.items.length > 0 ? (
              <Text style={styles.currencySectionTitle}>{section.title}</Text>
            ) : null}
            {section.items.map((opt) => {
              const selected = currency === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => pickCurrency(opt.id)}
                  style={[
                    styles.currencyRow,
                    selected && styles.currencyRowActive,
                  ]}>
                  <Text style={styles.currencyIconEmoji}>{opt.icon}</Text>
                  <View style={styles.currencyRowTextCol}>
                    <Text
                      style={[
                        styles.currencyPrimary,
                        selected && styles.currencyTextActive,
                      ]}
                      numberOfLines={2}>
                      {titleFromCurrencyLabel(opt.label)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.currencyIsoBadge,
                      selected && styles.currencyIsoBadgeActive,
                    ]}>
                    {opt.iso4217}
                  </Text>
                  {selected ? (
                    <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
                  ) : (
                    <View style={styles.currencyCheckPlaceholder} />
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
        <Pressable
          onPress={() => {
            setCurrencyQuery('');
            currencyModalRef.current?.close();
          }}
          style={({ pressed }) => [styles.modalClose, pressed && styles.pressed]}>
          <Text style={styles.modalCloseText}>Fermer</Text>
        </Pressable>
      </SilkyModalize>

      {Platform.OS === 'ios' ? (
        <SilkyModalize
          ref={timeModalRef}
          adjustToContentHeight
          scrollViewProps={{ keyboardShouldPersistTaps: 'handled' }}>
          <Text style={styles.timeModalSheetTitle}>Heure du rappel</Text>
          <DateTimePicker
            value={reminderDate}
            mode="time"
            display="spinner"
            onChange={onTimeChange}
            themeVariant="dark"
          />
          <Pressable
            style={styles.timeModalOk}
            onPress={() => timeModalRef.current?.close()}>
            <Text style={styles.timeModalOkText}>OK</Text>
          </Pressable>
        </SilkyModalize>
      ) : null}
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
    borderColor: colors.fuscousGray,
    backgroundColor: colors.dune,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  heroSub: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginTop: 6,
  },
  notifBlock: {
    backgroundColor: colors.dune,
    borderRadius: 16,
    padding: spacing.md + 4,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  notifTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  notifSub: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  notifStatus: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  notifStatusEm: {
    fontWeight: '800',
    color: colors.textPrimary,
  },
  notifActions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  notifBtnPrimary: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    alignItems: 'center',
  },
  notifBtnPrimaryText: {
    color: colors.textOnDark,
    fontSize: 16,
    fontWeight: '800',
  },
  notifBtnSecondary: {
    backgroundColor: colors.marshland,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  notifBtnSecondaryText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
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
  timeModalSheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
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
  dataBlock: {
    backgroundColor: colors.dune,
    borderRadius: 16,
    padding: spacing.md + 4,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dataBtn: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.marshland,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  dataBtnLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dataBtnDanger: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    backgroundColor: 'rgba(232, 93, 76, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(232, 93, 76, 0.35)',
    marginTop: spacing.sm,
  },
  dataBtnDangerLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.danger,
    textAlign: 'center',
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
  currencySearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    backgroundColor: colors.marshland,
  },
  currencySearchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    paddingVertical: 4,
  },
  currencyEmpty: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  currencySection: {
    marginBottom: spacing.md,
  },
  currencySectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  currencyIconEmoji: {
    fontSize: 28,
    lineHeight: 34,
    marginRight: 2,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  currencyRowActive: {
    backgroundColor: colors.fuscousGray,
    borderColor: colors.accent,
  },
  currencyRowTextCol: {
    flex: 1,
    minWidth: 0,
  },
  currencyPrimary: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 22,
  },
  currencyTextActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  currencyIsoBadge: {
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    color: colors.textMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.marshland,
    overflow: 'hidden',
  },
  currencyIsoBadgeActive: {
    color: colors.accent,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  currencyCheckPlaceholder: {
    width: 22,
    height: 22,
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
