import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { useStoreHydrated } from '@/src/hooks/use-store-hydrated';
import { useAppStore } from '@/src/store/use-app-store';

/**
 * Navigation au tap sur une notification + journal local des notifs reçues (app au premier plan).
 */
export function NotificationNavigationBridge() {
  const router = useRouter();
  const hydrated = useStoreHydrated();
  const appendNotificationLog = useAppStore((s) => s.appendNotificationLog);
  const coldHandled = useRef(false);

  useEffect(() => {
    if (!hydrated || Platform.OS === 'web') return;

    const navigate = (href: string) => {
      try {
        router.push(href as '/');
      } catch {
        router.replace('/(app)/(tabs)');
      }
    };

    void Notifications.getLastNotificationResponseAsync().then((last) => {
      if (coldHandled.current) return;
      const href = last?.notification.request.content.data?.href as string | undefined;
      if (href) {
        coldHandled.current = true;
        setTimeout(() => navigate(href), 400);
      }
    });

    const subTap = Notifications.addNotificationResponseReceivedListener((response) => {
      const href = response.notification.request.content.data?.href as string | undefined;
      if (href) navigate(href);
    });

    const subRecv = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body, data } = notification.request.content;
      appendNotificationLog({
        title: typeof title === 'string' ? title : 'UCHUMI',
        body: typeof body === 'string' ? body : '',
        href: typeof data?.href === 'string' ? data.href : undefined,
      });
    });

    return () => {
      subTap.remove();
      subRecv.remove();
    };
  }, [hydrated, router, appendNotificationLog]);

  return null;
}
