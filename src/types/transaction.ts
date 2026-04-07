/** Entrée, sortie, ou mise de côté (montants toujours positifs dans les données). */
export type TransactionKind = 'income' | 'expense' | 'savings';

export type Transaction = {
  id: string;
  kind: TransactionKind;
  /** Montant dans la devise du mouvement (strictement positif). */
  amount: number;
  /** Code ISO 4217 (ex. CDF, EUR, USD). */
  isoCurrency: string;
  /**
   * Taux : 1 unité de `isoCurrency` = `rateToDisplayCurrency` unités
   * de la devise d’affichage globale (au moment de l’enregistrement).
   */
  rateToDisplayCurrency: number;
  /** Montant équivalent dans la devise d’affichage (pour soldes et stats). */
  amountInDisplayCurrency: number;
  label: string;
  categoryId: string | null;
  /** Étiquettes libres (hors catégorie). */
  tags: string[];
  /** Note longue (optionnelle). */
  note: string;
  /** URI locale (photo ticket), optionnel. */
  attachmentUri: string | null;
  /** ISO 8601 */
  createdAt: string;
};
