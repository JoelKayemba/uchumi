import type { ImageSourcePropType } from 'react-native';

export type OnboardingSlide = {
  id: string;
  title: string;
  body: string;
  /** Captures dans assets/skip/ (accueil.png, plan.png, portefeuille.png, mouvement.png). */
  image: ImageSourcePropType;
};

/**
 * Images : dossier assets/skip/, ordre du carrousel accueil → plan → portefeuille → mouvement.
 */
export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'accueil',
    title: 'Repérez l’essentiel tout de suite',
    body: 'UCHUMI vous aide à voir où vous en êtes avant d’agir : une entrée dans l’app, une lecture claire de votre mois.',
    image: require('../../assets/skip/accueil.png'),
  },
  {
    id: 'plan',
    title: 'Donnez une structure à votre argent',
    body: 'L’objectif : organiser budgets, objectifs et charges récurrentes pour anticiper au lieu de subir.',
    image: require('../../assets/skip/plan.png'),
  },
  {
    id: 'portefeuille',
    title: 'Comprendre, pas seulement consulter',
    body: 'Suivez l’évolution de vos dépenses et retrouvez le fil de vos opérations quand vous en avez besoin.',
    image: require('../../assets/skip/portefeuille.png'),
  },
  {
    id: 'mouvements',
    title: 'Un journal qui raconte votre réalité',
    body: 'Chaque mouvement compte : gardez une trace ordonnée de ce qui entre et de ce qui sort, sans vous perdre.',
    image: require('../../assets/skip/mouvement.png'),
  },
];
