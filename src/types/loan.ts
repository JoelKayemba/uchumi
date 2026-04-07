export type Loan = {
  id: string;
  name: string;
  /** Capital restant (devise d’affichage). */
  remainingAmount: number;
  monthlyPayment: number;
  note: string;
};
