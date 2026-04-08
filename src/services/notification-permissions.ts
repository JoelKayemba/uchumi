import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

export type NotificationAuthStatus = 'granted' | 'denied' | 'undetermined';

export async function getNotificationAuthStatus(): Promise<NotificationAuthStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

/**
 * Demande l’autorisation d’afficher des notifications (rappels locaux, même app fermée).
 */
export async function requestNotificationPermissions(): Promise<NotificationAuthStatus> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return 'granted';
  const { status } = await Notifications.requestPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

/**
 * Ouvre les réglages système de l’app (iOS / Android) pour activer les notifications manuellement.
 */
export async function openAppSettingsForNotifications(): Promise<void> {
  await Linking.openSettings();
}
