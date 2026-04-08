import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert, Platform, Share } from 'react-native';

import { useAppStore } from '@/src/store/use-app-store';

function buildPayload(state: ReturnType<typeof useAppStore.getState>) {
  return {
    exportVersion: 3,
    exportedAt: new Date().toISOString(),
    app: 'uchumi',
    appMode: state.appMode,
    currency: state.currency,
    categories: state.categories,
    transactions: state.transactions,
    streakCount: state.streakCount,
    streakLastDate: state.streakLastDate,
    categoryBudgets: state.categoryBudgets,
    savingsGoals: state.savingsGoals,
    recurringRules: state.recurringRules,
    loans: state.loans,
    subscriptions: state.subscriptions,
    marketWatchlist: state.marketWatchlist,
    appLockEnabled: state.appLockEnabled,
    weeklySummaryEnabled: state.weeklySummaryEnabled,
    weeklySummaryWeekday: state.weeklySummaryWeekday,
    weeklySummaryHour: state.weeklySummaryHour,
    weeklySummaryMinute: state.weeklySummaryMinute,
  };
}

/**
 * Exporte les données (JSON) : fichier partageable sur iOS/Android, texte sur le web.
 */
export async function exportUchumiData(): Promise<void> {
  const state = useAppStore.getState();
  const json = JSON.stringify(buildPayload(state), null, 2);

  try {
    if (Platform.OS === 'web') {
      await Share.share({ message: json, title: 'Export UCHUMI' });
      return;
    }

    const dir = FileSystem.cacheDirectory;
    if (!dir) {
      await Share.share({ message: json, title: 'Export UCHUMI' });
      return;
    }

    const path = `${dir}uchumi-export-${Date.now()}.json`;
    await FileSystem.writeAsStringAsync(path, json, {
      encoding: 'utf8',
    });

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      await Share.share({ message: json, title: 'Export UCHUMI' });
      return;
    }

    await Sharing.shareAsync(path, {
      mimeType: 'application/json',
      dialogTitle: 'Export UCHUMI',
    });
  } catch (e) {
    Alert.alert(
      'Export impossible',
      e instanceof Error ? e.message : 'Une erreur est survenue.'
    );
  }
}
