import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { currencyOptionToIso } from '@/src/constants/currencies';
import { useFormatCurrency } from '@/src/hooks/use-format-currency';
import { formatCurrencyIso } from '@/src/lib/format-currency';
import { useAppStore } from '@/src/store/use-app-store';
import { finShell } from '@/src/theme/fin-shell';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';
import type { Transaction } from '@/src/types/transaction';

dayjs.locale('fr');

const KIND_LABEL: Record<Transaction['kind'], string> = {
  income: 'Entrée',
  expense: 'Dépense',
  savings: 'Épargne',
};

type TransactionRowProps = {
  transaction: Transaction;
  categoryName?: string;
  onPress?: () => void;
  onDelete: (id: string) => void;
};

function formatRateLine(
  transaction: Transaction,
  displayIso: string
): string | null {
  const from = transaction.isoCurrency.toUpperCase();
  const to = displayIso.toUpperCase();
  if (from === to) return null;
  const r = transaction.rateToDisplayCurrency;
  const decimals = r < 0.01 ? 6 : 4;
  return `1 ${from} = ${r.toFixed(decimals)} ${to}`;
}

export function TransactionRow({
  transaction,
  categoryName,
  onPress,
  onDelete,
}: TransactionRowProps) {
  const formatCurrency = useFormatCurrency();
  const displayCurrency = useAppStore((s) => s.currency);
  const displayIso = currencyOptionToIso(displayCurrency);

  const signedDisplay =
    transaction.kind === 'income'
      ? transaction.amountInDisplayCurrency
      : -transaction.amountInDisplayCurrency;
  const prefix = signedDisplay >= 0 ? '+' : '';

  const showFx =
    transaction.isoCurrency.toUpperCase() !== displayIso.toUpperCase();
  const rateLine = formatRateLine(transaction, displayIso);

  const confirmDelete = () => {
    Alert.alert(
      'Supprimer ce mouvement ?',
      'Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => onDelete(transaction.id),
        },
      ]
    );
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={confirmDelete}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.left}>
        <Text style={styles.label} numberOfLines={1}>
          {transaction.label || KIND_LABEL[transaction.kind]}
        </Text>
        <Text style={styles.meta}>
          {KIND_LABEL[transaction.kind]}
          {categoryName ? ` · ${categoryName}` : ''}
          {transaction.tags.length > 0
            ? ` · ${transaction.tags.slice(0, 3).join(', ')}`
            : ''}
          {' · '}
          {dayjs(transaction.createdAt).format('D MMM · HH:mm')}
        </Text>
      </View>
      <View style={styles.amountCol}>
        <Text
          style={[
            styles.amount,
            signedDisplay >= 0 ? styles.positive : styles.negative,
          ]}>
          {prefix}
          {formatCurrency(Math.abs(signedDisplay))}
        </Text>
        {showFx ? (
          <>
            <Text style={styles.fxOrig} numberOfLines={1}>
              {formatCurrencyIso(transaction.amount, transaction.isoCurrency)}
            </Text>
            {rateLine ? (
              <Text style={styles.fxRate} numberOfLines={2}>
                {rateLine}
              </Text>
            ) : null}
          </>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: finShell.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: finShell.border,
  },
  pressed: {
    opacity: 0.9,
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    color: finShell.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  meta: {
    color: finShell.muted,
    fontSize: 12,
    marginTop: 4,
  },
  amountCol: {
    alignItems: 'flex-end',
    maxWidth: '48%',
  },
  amount: {
    fontSize: 17,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  fxOrig: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  fxRate: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  positive: {
    color: colors.success,
  },
  negative: {
    color: colors.danger,
  },
});
