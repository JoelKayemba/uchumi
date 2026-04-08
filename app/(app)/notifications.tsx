import * as Notifications from 'expo-notifications';
import { useFocusEffect } from '@react-navigation/native';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/src/components/screen-header';
import { UchumiScreen } from '@/src/components/uchumi-screen';
import { useAppStore } from '@/src/store/use-app-store';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

dayjs.locale('fr');

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const log = useAppStore((s) => s.notificationLog);
  const clearNotificationLog = useAppStore((s) => s.clearNotificationLog);
  const [scheduled, setScheduled] = useState<
    Notifications.NotificationRequest[]
  >([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (Platform.OS === 'web') {
      setScheduled([]);
      setLoading(false);
      return;
    }
    void Notifications.getAllScheduledNotificationsAsync().then((list) => {
      setScheduled(list);
      setLoading(false);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      refresh();
    }, [refresh])
  );

  return (
    <UchumiScreen style={styles.wrap}>
      <ScreenHeader title="Notifications" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Rappels locaux sur cet appareil. Toucher une notification ouvre l’écran indiqué (accueil,
          saisie, abonnements…).
        </Text>

        <Text style={styles.section}>Récemment reçues (app ouverte)</Text>
        {log.length === 0 ? (
          <Text style={styles.empty}>Aucune notification enregistrée pour l’instant.</Text>
        ) : (
          log.map((e) => (
            <View key={e.id} style={styles.card}>
              <Text style={styles.cardTitle}>{e.title}</Text>
              <Text style={styles.cardBody}>{e.body}</Text>
              <Text style={styles.cardMeta}>
                {dayjs(e.receivedAt).format('D MMM YYYY · HH:mm')}
                {e.href ? ` · ${e.href}` : ''}
              </Text>
            </View>
          ))
        )}
        {log.length > 0 ? (
          <Pressable
            style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]}
            onPress={() => clearNotificationLog()}>
            <Text style={styles.clearBtnText}>Effacer l’historique local</Text>
          </Pressable>
        ) : null}

        <Text style={styles.section}>Planifiées (système)</Text>
        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: spacing.md }} />
        ) : Platform.OS === 'web' ? (
          <Text style={styles.empty}>Non disponible sur le web.</Text>
        ) : scheduled.length === 0 ? (
          <Text style={styles.empty}>
            Aucune notification planifiée (activez les rappels dans Réglages).
          </Text>
        ) : (
          scheduled.map((req) => (
            <View key={req.identifier} style={styles.cardMuted}>
              <Text style={styles.cardTitle}>
                {req.content.title ?? req.identifier}
              </Text>
              {req.content.body ? (
                <Text style={styles.cardBody}>{String(req.content.body)}</Text>
              ) : null}
              <Text style={styles.cardMeta}>ID : {req.identifier}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </UchumiScreen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: spacing.sm },
  scroll: { paddingHorizontal: spacing.md, gap: spacing.md },
  intro: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  section: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: spacing.sm,
  },
  empty: { fontSize: 14, color: colors.textSecondary, fontStyle: 'italic' },
  card: {
    backgroundColor: colors.dune,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    gap: 4,
  },
  cardMuted: {
    backgroundColor: colors.marshland,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    gap: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  cardBody: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  cardMeta: { fontSize: 11, color: colors.textMuted },
  clearBtn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
  },
  clearBtnText: { color: colors.danger, fontWeight: '700', fontSize: 15 },
  pressed: { opacity: 0.85 },
});
