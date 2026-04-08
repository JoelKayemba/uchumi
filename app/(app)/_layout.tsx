import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { NotificationPermissionModal } from '@/src/components/notification-permission-modal';
import { checkLowBalanceAfterTransactionsChange } from '@/src/services/low-balance';
import { useAppStore } from '@/src/store/use-app-store';
import { colors } from '@/src/theme';

export default function AppGroupLayout() {
  const transactions = useAppStore((s) => s.transactions);
  const lowBalanceEnabled = useAppStore((s) => s.lowBalanceEnabled);
  const lowBalanceThreshold = useAppStore((s) => s.lowBalanceThreshold);
  useEffect(() => {
    void checkLowBalanceAfterTransactionsChange();
  }, [transactions, lowBalanceEnabled, lowBalanceThreshold]);

  return (
    <>
    <NotificationPermissionModal />
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.marshland },
      }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="transaction/new" />
      <Stack.Screen name="transaction/[id]" />
      <Stack.Screen name="categories/index" />
      <Stack.Screen name="plan/budgets" />
      <Stack.Screen name="plan/goals" />
      <Stack.Screen name="plan/recurring" />
      <Stack.Screen name="plan/loans" />
      <Stack.Screen name="plan/subscriptions" />
      <Stack.Screen name="plan/calendar" />
      <Stack.Screen name="insights/past-expenses" />
      <Stack.Screen name="insights/upcoming-expenses" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="support" />
      <Stack.Screen name="privacy" />
    </Stack>
    </>
  );
}
