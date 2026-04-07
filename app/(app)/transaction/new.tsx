import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { currencyOptionToIso } from '@/src/constants/currencies';
import { TransactionForm } from '@/src/components/transaction-form';
import { getExchangeRate } from '@/src/services/exchange-rates';
import { useAppStore } from '@/src/store/use-app-store';

export default function NewTransactionScreen() {
  const router = useRouter();
  const addTransaction = useAppStore((s) => s.addTransaction);
  const currency = useAppStore((s) => s.currency);

  return (
    <TransactionForm
      submitLabel="Enregistrer"
      initialIsoCurrency={currencyOptionToIso(currency)}
      onSubmit={async (values) => {
        const displayIso = currencyOptionToIso(currency);
        try {
          const rate = await getExchangeRate(values.isoCurrency, displayIso);
          const amountInDisplay = values.amount * rate;
          addTransaction({
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
