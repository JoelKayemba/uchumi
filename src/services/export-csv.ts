import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert, Platform, Share } from 'react-native';

import { useAppStore } from '@/src/store/use-app-store';

function escapeCsvCell(s: string): string {
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildCsv(): string {
  const state = useAppStore.getState();
  const header = [
    'id',
    'createdAt',
    'kind',
    'amount',
    'isoCurrency',
    'amountDisplay',
    'label',
    'categoryId',
    'tags',
    'note',
  ].join(',');
  const lines = state.transactions.map((t) =>
    [
      escapeCsvCell(t.id),
      escapeCsvCell(t.createdAt),
      t.kind,
      String(t.amount),
      escapeCsvCell(t.isoCurrency),
      String(t.amountInDisplayCurrency),
      escapeCsvCell(t.label),
      t.categoryId ?? '',
      escapeCsvCell(t.tags.join(';')),
      escapeCsvCell(t.note),
    ].join(',')
  );
  return [header, ...lines].join('\n');
}

export async function exportUchumiCsv(): Promise<void> {
  const csv = buildCsv();
  const bom = '\uFEFF';
  const content = bom + csv;

  try {
    if (Platform.OS === 'web') {
      await Share.share({ message: content, title: 'Export UCHUMI CSV' });
      return;
    }

    const dir = FileSystem.cacheDirectory;
    if (!dir) {
      await Share.share({ message: content, title: 'Export UCHUMI CSV' });
      return;
    }

    const path = `${dir}uchumi-export-${Date.now()}.csv`;
    await FileSystem.writeAsStringAsync(path, content, { encoding: 'utf8' });

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      await Share.share({ message: content, title: 'Export UCHUMI CSV' });
      return;
    }

    await Sharing.shareAsync(path, {
      mimeType: 'text/csv',
      dialogTitle: 'Export CSV UCHUMI',
    });
  } catch (e) {
    Alert.alert(
      'Export CSV impossible',
      e instanceof Error ? e.message : 'Erreur inconnue.'
    );
  }
}
