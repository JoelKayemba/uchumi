import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useStoreHydrated } from '@/src/hooks/use-store-hydrated';
import {
  requestNotificationPermissions,
} from '@/src/services/notification-permissions';
import {
  syncReminderFromStore,
} from '@/src/services/reminder-notifications';
import { syncSubscriptionNotificationsFromStore } from '@/src/services/subscription-sync';
import { syncWeeklySummaryFromStore } from '@/src/services/weekly-summary-notifications';
import { useAppStore } from '@/src/store/use-app-store';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

/**
 * Première entrée dans l’app (après onboarding) : propose d’activer les notifications.
 * Les rappels sont locaux et peuvent se déclencher quand l’app n’est pas ouverte.
 */
export function NotificationPermissionModal() {
  const hydrated = useStoreHydrated();
  const hasSeen = useAppStore((s) => s.hasSeenNotificationPermissionPrompt);
  const setSeen = useAppStore((s) => s.setHasSeenNotificationPermissionPrompt);
  const setReminderPreferences = useAppStore((s) => s.setReminderPreferences);

  const [busy, setBusy] = useState(false);

  const visible =
    hydrated &&
    !hasSeen &&
    Platform.OS !== 'web';

  useEffect(() => {
    if (visible) {
      setBusy(false);
    }
  }, [visible]);

  const dismiss = () => {
    setSeen(true);
  };

  const onAccept = async () => {
    setBusy(true);
    try {
      const status = await requestNotificationPermissions();
      if (status === 'granted') {
        setReminderPreferences(true);
        await syncReminderFromStore();
        await syncWeeklySummaryFromStore();
        await syncSubscriptionNotificationsFromStore();
      }
    } finally {
      setBusy(false);
      setSeen(true);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={dismiss}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="notifications" size={36} color={colors.accent} />
          </View>
          <Text style={styles.title}>Activer les notifications ?</Text>
          <Text style={styles.body}>
            UCHUMI utilise des notifications locales sur votre téléphone (aucun serveur). Vous
            pourrez recevoir des rappels et alertes même lorsque l’application est fermée — selon
            les options que vous activez dans Réglages.
          </Text>
          <Text style={styles.hint}>
            Si vous refusez, vous pourrez toujours autoriser les notifications plus tard dans
            Réglages.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              (pressed || busy) && styles.primaryBtnPressed,
            ]}
            onPress={() => void onAccept()}
            disabled={busy}>
            {busy ? (
              <ActivityIndicator color={colors.textOnDark} />
            ) : (
              <Text style={styles.primaryBtnText}>Autoriser</Text>
            )}
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed]}
            onPress={dismiss}
            disabled={busy}>
            <Text style={styles.secondaryBtnText}>Plus tard</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  card: {
    backgroundColor: colors.dune,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  iconWrap: {
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  primaryBtnPressed: { opacity: 0.88 },
  primaryBtnText: {
    color: colors.textOnDark,
    fontSize: 17,
    fontWeight: '800',
  },
  secondaryBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryBtnPressed: { opacity: 0.75 },
  secondaryBtnText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
});
