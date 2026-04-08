import type { CurrencyOptionId } from '@/src/constants/currencies';

/**
 * Abonnement ou charge fixe (loyer, streaming, sport…).
 * Le montant est dans la devise choisie pour cet abonnement ; la prévision utilise une conversion indicative.
 */
export type SubscriptionPreset =
  | 'custom'
  | 'netflix'
  | 'spotify'
  | 'amazon_prime'
  | 'canva'
  | 'chatgpt'
  | 'disney'
  | 'youtube'
  | 'apple'
  | 'gym'
  | 'phone'
  | 'internet'
  | 'rent'
  | 'electricity'
  | 'insurance'
  | 'other';

export type Subscription = {
  id: string;
  name: string;
  /** Montant dans la devise de l’abonnement. */
  amount: number;
  /** Devise du montant (sélection utilisateur). */
  currencyId: CurrencyOptionId;
  /** Jour du mois de prélèvement / recharge (1–28). */
  billingDayOfMonth: number;
  preset: SubscriptionPreset;
  /** Charge qui se renouvelle chaque mois (prévision, rappels, jour J). */
  isMonthlyRecurring: boolean;
  categoryId: string | null;
  /** Rappel X jours avant l’échéance (ex. 2). */
  remindDaysBefore: number;
  /** Créer une dépense le jour J au lancement de l’app (si le jour correspond). */
  autoRecordExpense: boolean;
  /** Dernier mois où l’auto-enregistrement a eu lieu — "YYYY-MM". */
  lastAutoRecordedMonth: string | null;
  isActive: boolean;
  notes: string;
};
