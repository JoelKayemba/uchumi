import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { NOTIF_HREF } from '@/src/constants/notification-routes';
import {
  UCHUMI_ANDROID_CHANNEL_ID,
  UCHUMI_WEEKLY_SUMMARY_ID,
} from '@/src/constants/notifications';
import { useAppStore } from '@/src/store/use-app-store';

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(UCHUMI_ANDROID_CHANNEL_ID, {
    name: 'Rappels UCHUMI',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 200, 120, 200],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    sound: 'default',
  });
}

export async function cancelWeeklySummary(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(
    UCHUMI_WEEKLY_SUMMARY_ID
  );
}

/**
 * Chaque semaine : rappel pour ouvrir l’app et voir le résumé (les montants sont calculés à l’ouverture).
 * weekday : 1 = dimanche … 7 = samedi (Expo).
 */
export async function scheduleWeeklySummary(
  weekday: number,
  hour: number,
  minute: number
): Promise<void> {
  await ensureAndroidChannel();
  await cancelWeeklySummary();

  await Notifications.scheduleNotificationAsync({
    identifier: UCHUMI_WEEKLY_SUMMARY_ID,
    content: {
      title: 'UCHUMI — votre semaine',
      body:
        'Résumé des dépenses et idées du moment : ouvrez l’app pour voir le détail (tout reste sur l’appareil).',
      data: { href: NOTIF_HREF.pastInsights },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: Math.max(1, Math.min(7, weekday)),
      hour: Math.max(0, Math.min(23, hour)),
      minute: Math.max(0, Math.min(59, minute)),
      channelId:
        Platform.OS === 'android' ? UCHUMI_ANDROID_CHANNEL_ID : undefined,
    },
  });
}

export async function syncWeeklySummaryFromStore(): Promise<void> {
  const {
    weeklySummaryEnabled,
    weeklySummaryWeekday,
    weeklySummaryHour,
    weeklySummaryMinute,
  } = useAppStore.getState();

  if (!weeklySummaryEnabled) {
    await cancelWeeklySummary();
    return;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      useAppStore.getState().setWeeklySummaryPreferences(false);
      return;
    }
  }

  await scheduleWeeklySummary(
    weeklySummaryWeekday,
    weeklySummaryHour,
    weeklySummaryMinute
  );
}
