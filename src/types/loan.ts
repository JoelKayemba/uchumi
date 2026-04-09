export type Loan = {
  id: string;
  name: string;
  /** Montant total du prêt (capital initial, devise d’affichage). */
  totalAmount: number;
  /** Mensualité prélevée chaque mois. */
  monthlyPayment: number;
  /** Solde restant après les prélèvements enregistrés. */
  remainingAmount: number;
  /** Jour du mois du prélèvement (1–28). */
  debitDay: number;
  /** Date de création du prêt (calcul des échéances). ISO 8601. */
  createdAt: string;
  /**
   * Dernier mois (YYYY-MM) pour lequel la mensualité a été déduite du solde.
   * `null` = aucune déduction automatique encore enregistrée.
   */
  lastProcessedMonth: string | null;
  note: string;
};
