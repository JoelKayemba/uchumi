import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { currencyOptionToIso } from '@/src/constants/currencies';
import { TransactionForm } from '@/src/components/transaction-form';
import { getExchangeRate } from '@/src/services/exchange-rates';
import { useAppStore } from '@/src/store/use-app-store';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const transaction = useAppStore((s) => s.transactions.find((t) => t.id === id));
  const updateTransaction = useAppStore((s) => s.updateTransaction);
  const currency = useAppStore((s) => s.currency);

  if (!transaction) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>Mouvement introuvable.</Text>
      </View>
    );
  }

  return (
    <TransactionForm
      key={transaction.id}
      submitLabel="Enregistrer les modifications"
      initialKind={transaction.kind}
      initialAmount={transaction.amount}
      initialLabel={transaction.label}
      initialCategoryId={transaction.categoryId}
      initialIsoCurrency={transaction.isoCurrency}
      initialTags={transaction.tags}
      initialNote={transaction.note}
      initialAttachmentUri={transaction.attachmentUri}
      onSubmit={async (values) => {
        const displayIso = currencyOptionToIso(currency);
        try {
          const rate = await getExchangeRate(values.isoCurrency, displayIso);
          const amountInDisplay = values.amount * rate;
          updateTransaction(transaction.id, {
            kind: values.kind,
            amount: values.amount,
            isoCurrency: values.isoCurrency,
            rateToDisplayCurrency: rate,
            amountInDisplayCurrency: amountInDisplay,
            label: values.label,
            categoryId: values.categoryId,
            tags: values.tags,
            note: values.note,
            attachmentUri: values.attachmentUri,
          });
          router.back();
        } catch (e) {
          Alert.alert(
            'Conversion impossible',
            e instanceof Error ? e.message : 'Erreur inconnue.'
          );
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  missing: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.marshland,
    padding: spacing.lg,
  },
  missingText: {
    color: colors.textMuted,
    fontSize: 16,
  },
});
