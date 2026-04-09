import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AppErrorBoundary } from '@/src/components/app-error-boundary';
import { AppLoadingOverlay } from '@/src/components/app-loading-overlay';
import { NotificationNavigationBridge } from '@/src/components/notification-navigation-bridge';
import { useStoreHydrated } from '@/src/hooks/use-store-hydrated';
import { initMobileAdsSdk } from '@/src/services/ads-init';
import { initObservability } from '@/src/services/observability';
import {
  configureNotificationHandler,
  syncReminderFromStore,
} from '@/src/services/reminder-notifications';
import {
  processSubscriptionAutoRecords,
  syncSubscriptionNotificationsFromStore,
} from '@/src/services/subscription-sync';
import { syncWeeklySummaryFromStore } from '@/src/services/weekly-summary-notifications';
import { useAppStore } from '@/src/store/use-app-store';
import { colors } from '@/src/theme';

configureNotificationHandler();
initObservability();

SplashScreen.preventAutoHideAsync().catch(() => {});

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.textPrimary,
    background: colors.marshland,
    card: colors.dune,
    text: colors.textPrimary,
    border: colors.fuscousGray,
    notification: colors.danger,
  },
};

export default function RootLayout() {
  const hydrated = useStoreHydrated();
  const reminderEnabled = useAppStore((s) => s.reminderEnabled);
  const reminderHour = useAppStore((s) => s.reminderHour);
  const reminderMinute = useAppStore((s) => s.reminderMinute);
  const weeklySummaryEnabled = useAppStore((s) => s.weeklySummaryEnabled);
  const weeklySummaryWeekday = useAppStore((s) => s.weeklySummaryWeekday);
  const weeklySummaryHour = useAppStore((s) => s.weeklySummaryHour);
  const weeklySummaryMinute = useAppStore((s) => s.weeklySummaryMinute);
  const subscriptions = useAppStore((s) => s.subscriptions);

  useEffect(() => {
    if (hydrated) {
      SplashScreen.hideAsync().catch(() => {});
      initMobileAdsSdk();
    }
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    useAppStore.getState().syncLoanDeductions();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        useAppStore.getState().syncLoanDeductions();
      }
    });
    return () => sub.remove();
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    void syncReminderFromStore();
  }, [hydrated, reminderEnabled, reminderHour, reminderMinute]);

  useEffect(() => {
    if (!hydrated) return;
    void syncWeeklySummaryFromStore();
  }, [
    hydrated,
    weeklySummaryEnabled,
    weeklySummaryWeekday,
    weeklySummaryHour,
    weeklySummaryMinute,
  ]);

  useEffect(() => {
    if (!hydrated) return;
    processSubscriptionAutoRecords();
    void syncSubscriptionNotificationsFromStore();
  }, [hydrated, subscriptions]);

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <ThemeProvider value={navigationTheme}>
        <AppErrorBoundary>
          <NotificationNavigationBridge />
          <View style={styles.root}>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.marshland } }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(app)" />
              <Stack.Screen
                name="modal"
                options={{ presentation: 'modal', headerShown: false, contentStyle: { backgroundColor: colors.marshland } }}
              />
            </Stack>
            <AppLoadingOverlay visible={!hydrated} />
          </View>
          <StatusBar style="dark" />
        </AppErrorBoundary>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  root: {
    flex: 1,
    backgroundColor: colors.marshland,
  },
});
