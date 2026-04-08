import type { ImageSourcePropType } from 'react-native';

export type OnboardingSlide = {
  id: string;
  title: string;
  body: string;
  /** Image pleine largeur (remplacez les fichiers dans assets/images/onboarding/). */
  image: ImageSourcePropType;
};

/**
 * Remplacez slide-1.png, slide-2.png, slide-3.png par vos captures d’écran
 * (même noms de fichiers, même dossier).
 */
export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Bienvenue sur UCHUMI',
    body:
      'Votre argent au quotidien : solde, dépenses et charges à venir, dans une interface claire et locale.',
    image: require('../../assets/images/onboarding/slide-1.png'),
  },
  {
    id: '2',
    title: 'Tout voir d’un coup d’œil',
    body:
      'Catégories, mouvements et rappels pour ne rien laisser passer — sans serveur, vos données restent sur l’appareil.',
    image: require('../../assets/images/onboarding/slide-2.png'),
  },
  {
    id: '3',
    title: 'Vous gardez la main',
    body:
      'Export JSON ou CSV quand vous voulez, rappels optionnels. Passez les écrans ou continuez pour choisir votre mode.',
    image: require('../../assets/images/onboarding/slide-3.png'),
  },
];
