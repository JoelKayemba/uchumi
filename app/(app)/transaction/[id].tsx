import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { currencyOptionToIso } from '@/src/constants/currencies';
import { ScreenHeader } from '@/src/components/screen-header';
import { TransactionForm } from '@/src/components/transaction-form';
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
      <SafeAreaView style={styles.missingSafe} edges={['top', 'left', 'right']}>
        <View style={styles.missingHeaderPad}>
          <ScreenHeader title="Modifier" onBack={() => router.back()} />
        </View>
        <View style={styles.missing}>
          <Text style={styles.missingText}>Mouvement introuvable.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <TransactionForm
      key={transaction.id}
      headerTitle="Modifier"
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
        updateTransaction(transaction.id, {
          kind: values.kind,
          amount: values.amount,
          isoCurrency: values.isoCurrency,
          rateToDisplayCurrency: 1,
          amountInDisplayCurrency: values.amount,
          label: values.label,
          categoryId: values.categoryId,
          tags: values.tags,
          note: values.note,
          attachmentUri: values.attachmentUri,
        });
        router.back();
      }}
    />
  );
}

const styles = StyleSheet.create({
  missingSafe: {
    flex: 1,
    backgroundColor: colors.marshland,
  },
  missingHeaderPad: {
    paddingHorizontal: spacing.md,
  },
  missing: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  missingText: {
    color: colors.textMuted,
    fontSize: 16,
  },
});
