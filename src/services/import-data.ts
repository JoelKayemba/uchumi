import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert, Platform } from 'react-native';

import { uchumiExportV1Schema } from '@/src/schemas/uchumi-export';
import { useAppStore } from '@/src/store/use-app-store';
import type { Category } from '@/src/types/category';
import type { Transaction } from '@/src/types/transaction';

function sanitizeTransactions(
  transactions: readonly Transaction[],
  categoryIds: Set<string>
): Transaction[] {
  return transactions.map((t) => ({
    ...t,
    categoryId:
      t.categoryId && categoryIds.has(t.categoryId) ? t.categoryId : null,
  }));
}

async function readAssetText(uri: string, file?: File): Promise<string> {
  if (Platform.OS === 'web' && file) {
    return file.text();
  }
  return FileSystem.readAsStringAsync(uri, { encoding: 'utf8' });
}

/**
 * Choisit un fichier JSON et remplace catégories + transactions (et optionnellement devise / mode).
 */
export async function pickAndImportUchumiJson(): Promise<void> {
  if (Platform.OS === 'web') {
    Alert.alert(
      'Import',
      'L’import depuis un fichier sera disponible sur l’app iOS ou Android. Sur le web, collez le JSON dans une prochaine version si besoin.'
    );
    return;
  }

  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    const raw = await readAssetText(asset.uri, asset.file);
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      Alert.alert('Fichier invalide', 'Le contenu n’est pas du JSON valide.');
      return;
    }

    const parsedResult = uchumiExportV1Schema.safeParse(parsed);
    if (!parsedResult.success) {
      Alert.alert(
        'Format non reconnu',
        'Ce fichier ne correspond pas à un export UCHUMI (v1 à v3).'
      );
      return;
    }

    const data = parsedResult.data;
    const rawObj = parsed as Record<string, unknown>;
    const categoryIds = new Set(data.categories.map((c) => c.id));
    const transactions = sanitizeTransactions(data.transactions, categoryIds);
    const categories: Category[] = data.categories;

    Alert.alert(
      'Remplacer les données ?',
      `Cette opération remplace vos catégories et mouvements actuels par le contenu du fichier (${transactions.length} mouvement(s)).`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Importer',
          style: 'destructive',
          onPress: () => {
            useAppStore.getState().importAppData({
              categories,
              transactions,
              currency: data.currency,
              appMode: data.appMode ?? undefined,
              streakCount:
                typeof rawObj.streakCount === 'number'
                  ? rawObj.streakCount
                  : undefined,
              streakLastDate:
                typeof rawObj.streakLastDate === 'string' ||
                rawObj.streakLastDate === null
                  ? (rawObj.streakLastDate as string | null)
                  : undefined,
              categoryBudgets:
                rawObj.categoryBudgets &&
                typeof rawObj.categoryBudgets === 'object'
                  ? (rawObj.categoryBudgets as Record<string, number>)
                  : undefined,
              savingsGoals: Array.isArray(rawObj.savingsGoals)
                ? (rawObj.savingsGoals as import('@/src/types/savings-goal').SavingsGoal[])
                : undefined,
              recurringRules: Array.isArray(rawObj.recurringRules)
                ? (rawObj.recurringRules as import('@/src/types/recurring').RecurringRule[])
                : undefined,
              loans: Array.isArray(rawObj.loans)
                ? (rawObj.loans as import('@/src/types/loan').Loan[])
                : undefined,
              subscriptions: Array.isArray(rawObj.subscriptions)
                ? (rawObj.subscriptions as import('@/src/types/subscription').Subscription[])
                : undefined,
              marketWatchlist: Array.isArray(rawObj.marketWatchlist)
                ? (rawObj.marketWatchlist as string[])
                : undefined,
              appLockEnabled:
                typeof rawObj.appLockEnabled === 'boolean'
                  ? rawObj.appLockEnabled
                  : undefined,
              weeklySummaryEnabled:
                typeof rawObj.weeklySummaryEnabled === 'boolean'
                  ? rawObj.weeklySummaryEnabled
                  : undefined,
              weeklySummaryWeekday:
                typeof rawObj.weeklySummaryWeekday === 'number'
                  ? rawObj.weeklySummaryWeekday
                  : undefined,
              weeklySummaryHour:
                typeof rawObj.weeklySummaryHour === 'number'
                  ? rawObj.weeklySummaryHour
                  : undefined,
              weeklySummaryMinute:
                typeof rawObj.weeklySummaryMinute === 'number'
                  ? rawObj.weeklySummaryMinute
                  : undefined,
            });
            Alert.alert('Import terminé', 'Vos données ont été mises à jour.');
          },
        },
      ]
    );
  } catch (e) {
    Alert.alert(
      'Import impossible',
      e instanceof Error ? e.message : 'Erreur inconnue.'
    );
  }
}
