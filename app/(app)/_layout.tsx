import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { checkLowBalanceAfterTransactionsChange } from '@/src/services/low-balance';
import { useAppStore } from '@/src/store/use-app-store';
import { colors } from '@/src/theme';

const stackHeader = {
  headerStyle: {
    backgroundColor: colors.dune,
    borderBottomWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitleStyle: {
    fontWeight: '800' as const,
    fontSize: 17,
    color: colors.textPrimary,
  },
  headerTintColor: colors.textPrimary,
  headerShadowVisible: false,
  headerBackTitleVisible: false,
};

export default function AppGroupLayout() {
  const transactions = useAppStore((s) => s.transactions);
  const lowBalanceEnabled = useAppStore((s) => s.lowBalanceEnabled);
  const lowBalanceThreshold = useAppStore((s) => s.lowBalanceThreshold);
  useEffect(() => {
    void checkLowBalanceAfterTransactionsChange();
  }, [transactions, lowBalanceEnabled, lowBalanceThreshold]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.marshland },
      }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="transaction/new"
        options={{
          headerShown: true,
          title: 'Nouveau mouvement',
          ...stackHeader,
          contentStyle: { backgroundColor: colors.marshland },
        }}
      />
      <Stack.Screen
        name="transaction/[id]"
        options={{
          headerShown: true,
          title: 'Modifier',
          ...stackHeader,
          contentStyle: { backgroundColor: colors.marshland },
        }}
      />
      <Stack.Screen
        name="categories/index"
        options={{
          headerShown: true,
          title: 'Catégories',
          ...stackHeader,
          contentStyle: { backgroundColor: colors.marshland },
        }}
      />
      <Stack.Screen
        name="plan/budgets"
        options={{
          headerShown: true,
          title: 'Budgets',
          ...stackHeader,
          contentStyle: { backgroundColor: colors.marshland },
        }}
      />
      <Stack.Screen
        name="plan/goals"
        options={{
          headerShown: true,
          title: 'Objectifs',
          ...stackHeader,
          contentStyle: { backgroundColor: colors.marshland },
        }}
      />
      <Stack.Screen
        name="plan/recurring"
        options={{
          headerShown: true,
          title: 'Récurrences',
          ...stackHeader,
          contentStyle: { backgroundColor: colors.marshland },
        }}
      />
      <Stack.Screen
        name="plan/loans"
        options={{
          headerShown: true,
          title: 'Crédits',
          ...stackHeader,
          contentStyle: { backgroundColor: colors.marshland },
        }}
      />
      <Stack.Screen
        name="plan/calendar"
        options={{
          headerShown: true,
          title: 'Calendrier',
          ...stackHeader,
          contentStyle: { backgroundColor: colors.marshland },
        }}
      />
    </Stack>
  );
}
