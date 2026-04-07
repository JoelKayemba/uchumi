import * as Notifications from 'expo-notifications';

import { computeAvailable } from '@/src/domain/balance';
import { formatCurrency } from '@/src/lib/format-currency';
import { useAppStore } from '@/src/store/use-app-store';

/**
 * Après un changement de mouvements : notifie une fois par jour si le solde
 * (en devise d’affichage) passe sous le seuil.
 */
export async function checkLowBalanceAfterTransactionsChange(): Promise<void> {
  const state = useAppStore.getState();
  const {
    transactions,
    lowBalanceEnabled,
    lowBalanceThreshold,
    currency,
    lastLowBalanceNotificationDay,
  } = state;

  if (!lowBalanceEnabled || lowBalanceThreshold == null || lowBalanceThreshold <= 0) {
    return;
  }

  const available = computeAvailable(transactions);
  const today = new Date().toDateString();

  if (available >= lowBalanceThreshold) {
    if (lastLowBalanceNotificationDay !== null) {
      useAppStore.getState().setLastLowBalanceNotificationDay(null);
    }
    return;
  }

  if (lastLowBalanceNotificationDay === today) {
    return;
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'UCHUMI — Fond faible',
      body: `Solde disponible : ${formatCurrency(available, currency)} (seuil : ${formatCurrency(lowBalanceThreshold, currency)}).`,
    },
    trigger: null,
  });

  useAppStore.getState().setLastLowBalanceNotificationDay(today);
}
