import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  UCHUMI_ANDROID_CHANNEL_ID,
  UCHUMI_DAILY_REMINDER_ID,
} from '@/src/constants/notifications';
import { useAppStore } from '@/src/store/use-app-store';

let handlerConfigured = false;

export function configureNotificationHandler(): void {
  if (handlerConfigured) return;
  handlerConfigured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(UCHUMI_ANDROID_CHANNEL_ID, {
    name: 'Rappels UCHUMI',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 120, 200],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    sound: 'default',
  });
}

export async function cancelUchumiDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(
    UCHUMI_DAILY_REMINDER_ID
  );
}

export async function scheduleUchumiDailyReminder(
  hour: number,
  minute: number
): Promise<void> {
  await ensureAndroidChannel();
  await cancelUchumiDailyReminder();

  await Notifications.scheduleNotificationAsync({
    identifier: UCHUMI_DAILY_REMINDER_ID,
    content: {
      title: 'Rappel UCHUMI — saisie du jour',
      body:
        'Enregistrez au moins un mouvement (entrée, dépense ou épargne) pour garder votre budget à jour.',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: Math.max(0, Math.min(23, hour)),
      minute: Math.max(0, Math.min(59, minute)),
      channelId:
        Platform.OS === 'android' ? UCHUMI_ANDROID_CHANNEL_ID : undefined,
    },
  });
}

/**
 * Applique l’état du store : désactive ou reprogramme le rappel quotidien.
 */
export async function syncReminderFromStore(): Promise<void> {
  const { reminderEnabled, reminderHour, reminderMinute } =
    useAppStore.getState();

  if (!reminderEnabled) {
    await cancelUchumiDailyReminder();
    return;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      useAppStore.getState().setReminderPreferences(false);
      return;
    }
  }

  await scheduleUchumiDailyReminder(reminderHour, reminderMinute);
}
