export type SavingsGoal = {
  id: string;
  name: string;
  /** Objectif en devise d’affichage. */
  targetAmount: number;
  /** Montant déjà mis de côté (saisi manuellement ou ajusté). */
  savedAmount: number;
  /** Date cible ISO (jour), ou null. */
  targetDate: string | null;
};
