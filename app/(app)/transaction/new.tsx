import { useRouter } from 'expo-router';

import { currencyOptionToIso } from '@/src/constants/currencies';
import { TransactionForm } from '@/src/components/transaction-form';
import { useAppStore } from '@/src/store/use-app-store';

export default function NewTransactionScreen() {
  const router = useRouter();
  const addTransaction = useAppStore((s) => s.addTransaction);
  const currency = useAppStore((s) => s.currency);

  return (
    <TransactionForm
      headerTitle="Nouveau mouvement"
      submitLabel="Enregistrer"
      initialIsoCurrency={currencyOptionToIso(currency)}
      onSubmit={async (values) => {
        addTransaction({
          kind: values.kind,
          amount: values.amount,
          isoCurrency: values.isoCurrency,
          // On conserve l'opération dans sa devise d'origine.
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
