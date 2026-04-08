/**
 * Contenus 100 % locaux (offline) — idées business & finance Afrique / RDC.
 * Utilisés si pas de réseau ou si l’actualité distante échoue.
 */
export type BundledInsight = {
  id: string;
  title: string;
  summary: string;
  /** Nom d’icône Ionicons */
  icon: 'trending-up' | 'globe' | 'leaf' | 'business' | 'pie-chart' | 'rocket';
  gradient: readonly [string, string];
};

export const AFRICA_FINANCE_DIGEST: readonly BundledInsight[] = [
  {
    id: 'b1',
    title: 'Diversifier hors monnaie locale',
    summary:
      'Répartir une épargne entre actifs en USD / EUR et projets locaux peut limiter le risque de change (à adapter à votre situation).',
    icon: 'pie-chart',
    gradient: ['#4a6670', '#2f3d42'],
  },
  {
    id: 'b2',
    title: 'RDC — chaîne de valeur agricole',
    summary:
      'Transformation locale (séchage, conditionnement) ajoute souvent plus de marge que la seule vente brute de matière.',
    icon: 'leaf',
    gradient: ['#4a6b5a', '#263830'],
  },
  {
    id: 'b3',
    title: 'Afrique — économie numérique',
    summary:
      'Paiements mobiles et services digitaux continuent de structurer le commerce ; anticiper les coûts de transaction dans vos budgets.',
    icon: 'rocket',
    gradient: ['#5c4a6b', '#352a40'],
  },
  {
    id: 'b4',
    title: 'Trésorerie avant croissance',
    summary:
      'En PME, sécuriser 2–3 mois de charges avant d’investir massivement réduit le risque de rupture de cash-flow.',
    icon: 'business',
    gradient: ['#6b5a4a', '#3d3228'],
  },
  {
    id: 'b5',
    title: 'Veille réglementaire',
    summary:
      'Fiscalité et douanes évoluent vite : une petite réserve budgétaire « conformité » évite les surprises de fin d’exercice.',
    icon: 'globe',
    gradient: ['#3d4f5c', '#2a3038'],
  },
  {
    id: 'b6',
    title: 'Investissement progressif',
    summary:
      'Entrer par tranches (DCA) sur un projet ou un marché limite le risque de mauvais timing.',
    icon: 'trending-up',
    gradient: ['#4a6670', '#2a3038'],
  },
] as const;

export function bundledInsightForDay(date = new Date()): BundledInsight {
  const start = new Date(date.getFullYear(), 0, 0).getTime();
  const day = Math.floor((date.getTime() - start) / 86400000);
  return AFRICA_FINANCE_DIGEST[day % AFRICA_FINANCE_DIGEST.length];
}
