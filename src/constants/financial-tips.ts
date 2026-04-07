/** Conseils courts affichés sur le tableau de bord (rotation par jour). */
export const FINANCIAL_TIPS_FR: readonly string[] = [
  'Fixez une enveloppe hebdomadaire pour les petites dépenses : plus simple à suivre qu’un budget mensuel seul.',
  'Séparez l’épargne dès l’entrée d’argent : « payer votre moi futur » en premier.',
  'Revoyez les abonnements une fois par trimestre : un oubli coûte souvent plus qu’un café.',
  'Notez les dépenses le jour même : la mémoire sous-estime toujours les sorties.',
  'Un fonds d’urgence (quelques mois de charges) évite l’endettement lors d’un imprévu.',
  'Comparez toujours en devise d’affichage : les conversions mentales induisent des erreurs.',
  'Pour un projet, estimez large puis découpez en étapes : moins de mauvaises surprises.',
];

export function tipForDay(date = new Date()): string {
  const start = new Date(date.getFullYear(), 0, 0).getTime();
  const day = Math.floor((date.getTime() - start) / 86400000);
  return FINANCIAL_TIPS_FR[day % FINANCIAL_TIPS_FR.length];
}
