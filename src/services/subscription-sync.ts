import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import dayjs from 'dayjs';

import { NOTIF_HREF } from '@/src/constants/notification-routes';
import { UCHUMI_ANDROID_CHANNEL_ID } from '@/src/constants/notifications';
import { currencyOptionToIso } from '@/src/constants/currencies';
import { subscriptionAmountToDisplay } from '@/src/domain/subscription-amount';
import {
  currentMonthKey,
  getNextBillingDate,
  isBillingDayToday,
} from '@/src/domain/subscription-dates';
import { formatCurrency } from '@/src/lib/format-currency';
import { useAppStore } from '@/src/store/use-app-store';
import type { Subscription } from '@/src/types/subscription';

const REM_ID = (id: string) => `uchumi-sub-rem-${id}`;
const DUE_ID = (id: string) => `uchumi-sub-due-${id}`;

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(UCHUMI_ANDROID_CHANNEL_ID, {
    name: 'Rappels UCHUMI',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 200, 120, 200],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    sound: 'default',
  });
}

/** Prochain rappel « J−X » strictement dans le futur. */
function nextReminderMoment(
  sub: Subscription
): dayjs.Dayjs | null {
  const before = Math.max(0, Math.min(28, sub.remindDaysBefore));
  if (before === 0) return null;
  const d = Math.min(Math.max(1, sub.billingDayOfMonth), 28);
  let bill = getNextBillingDate(sub.billingDayOfMonth);
  let reminder = bill
    .subtract(before, 'day')
    .hour(9)
    .minute(0)
    .second(0)
    .millisecond(0);
  const now = dayjs();
  let guard = 0;
  while (
    (reminder.isBefore(now) || reminder.isSame(now)) &&
    guard < 36
  ) {
    bill = bill.add(1, 'month').date(d).startOf('day');
    reminder = bill
      .subtract(before, 'day')
      .hour(9)
      .minute(0)
      .second(0)
      .millisecond(0);
    guard++;
  }
  if (guard >= 36) return null;
  return reminder;
}

/** Prochaine échéance à 9h, strictement dans le futur. */
function nextDueMoment(sub: Subscription): dayjs.Dayjs | null {
  const d = Math.min(Math.max(1, sub.billingDayOfMonth), 28);
  let bill = getNextBillingDate(sub.billingDayOfMonth)
    .hour(9)
    .minute(0)
    .second(0)
    .millisecond(0);
  const now = dayjs();
  let guard = 0;
  while ((bill.isBefore(now) || bill.isSame(now)) && guard < 36) {
    bill = bill.add(1, 'month').date(d).hour(9).minute(0).second(0).millisecond(0);
    guard++;
  }
  if (guard >= 36) return null;
  return bill;
}

export async function cancelSubscriptionNotifications(subId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(REM_ID(subId)).catch(
    () => {}
  );
  await Notifications.cancelScheduledNotificationAsync(DUE_ID(subId)).catch(
    () => {}
  );
}

function displayAmountLabel(sub: Subscription): string {
  return formatCurrency(sub.amount, sub.currencyId);
}

/**
 * Reprogramme les rappels pour les abonnements actifs et mensuels.
 */
export async function syncSubscriptionNotificationsFromStore(): Promise<void> {
  const { subscriptions } = useAppStore.getState();

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;
  }

  await ensureAndroidChannel();

  const knownIds = new Set(subscriptions.map((s) => s.id));
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const n of scheduled) {
    const id = n.identifier ?? '';
    if (!id.startsWith('uchumi-sub-rem-') && !id.startsWith('uchumi-sub-due-')) {
      continue;
    }
    const subId = id.replace(/^uchumi-sub-(rem|due)-/, '');
    if (!knownIds.has(subId)) {
      await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    }
  }

  for (const sub of subscriptions) {
    await cancelSubscriptionNotifications(sub.id);
  }

  const monthlyActive = subscriptions.filter(
    (s) => s.isActive && s.isMonthlyRecurring
  );

  for (const sub of monthlyActive) {
    const label = displayAmountLabel(sub);

    const rem = nextReminderMoment(sub);
    if (rem) {
      await Notifications.scheduleNotificationAsync({
        identifier: REM_ID(sub.id),
        content: {
          title: `UCHUMI — ${sub.name}`,
          body: `Échéance dans ${sub.remindDaysBefore} jour(s) · ${label}.`,
          data: { href: NOTIF_HREF.subscriptions },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: rem.toDate(),
          channelId:
            Platform.OS === 'android' ? UCHUMI_ANDROID_CHANNEL_ID : undefined,
        },
      });
    }

    const due = nextDueMoment(sub);
    if (due && (!rem || !due.isSame(rem, 'minute'))) {
      await Notifications.scheduleNotificationAsync({
        identifier: DUE_ID(sub.id),
        content: {
          title: `UCHUMI — ${sub.name}`,
          body: `Aujourd’hui : paiement / prélèvement prévu (${label}).`,
          data: { href: NOTIF_HREF.subscriptions },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: due.toDate(),
          channelId:
            Platform.OS === 'android' ? UCHUMI_ANDROID_CHANNEL_ID : undefined,
        },
      });
    }
  }
}

/**
 * Au lancement : crée une dépense pour chaque abonnement « auto » si nous sommes le jour J et pas encore enregistré ce mois-ci.
 */
export function processSubscriptionAutoRecords(): void {
  const state = useAppStore.getState();
  const month = currentMonthKey();
  const display = state.currency;

  for (const sub of state.subscriptions) {
    if (!sub.isActive || !sub.autoRecordExpense || !sub.isMonthlyRecurring) continue;
    if (!isBillingDayToday(sub.billingDayOfMonth)) continue;
    if (sub.lastAutoRecordedMonth === month) continue;
    const nativeAmt = sub.amount;
    if (!Number.isFinite(nativeAmt) || nativeAmt <= 0) continue;

    const amountInDisplay = subscriptionAmountToDisplay(
      nativeAmt,
      sub.currencyId,
      display
    );
    const iso = currencyOptionToIso(sub.currencyId);
    const rate = nativeAmt > 0 ? amountInDisplay / nativeAmt : 1;

    state.addTransaction({
      kind: 'expense',
      amount: nativeAmt,
      isoCurrency: iso,
      rateToDisplayCurrency: rate,
      amountInDisplayCurrency: amountInDisplay,
      label: sub.name,
      categoryId: sub.categoryId,
      tags: ['abonnement-auto'],
      note: 'Enregistré automatiquement (abonnement / charge fixe).',
      attachmentUri: null,
    });
    state.updateSubscription(sub.id, { lastAutoRecordedMonth: month });
  }
}
