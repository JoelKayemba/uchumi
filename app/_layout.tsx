import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { AppLockGate } from '@/src/components/app-lock-gate';
import { useStoreHydrated } from '@/src/hooks/use-store-hydrated';
import {
  configureNotificationHandler,
  syncReminderFromStore,
} from '@/src/services/reminder-notifications';
import { useAppStore } from '@/src/store/use-app-store';
import { colors } from '@/src/theme';

configureNotificationHandler();

SplashScreen.preventAutoHideAsync().catch(() => {});

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
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

  useEffect(() => {
    if (hydrated) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    void syncReminderFromStore();
  }, [hydrated, reminderEnabled, reminderHour, reminderMinute]);

  return (
    <ThemeProvider value={navigationTheme}>
      <View style={styles.root}>
        <AppLockGate>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.marshland } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen
            name="modal"
            options={{ presentation: 'modal', headerShown: false, contentStyle: { backgroundColor: colors.marshland } }}
          />
          </Stack>
        </AppLockGate>
      </View>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.marshland,
  },
});
