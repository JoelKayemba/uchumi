import Ionicons from '@expo/vector-icons/Ionicons';

import type { SubscriptionPreset } from '@/src/types/subscription';

type Glyph = keyof typeof Ionicons.glyphMap;

/**
 * Logos : PNG Wikimedia (réseau requis au premier affichage, puis cache).
 * Icône de secours si échec de chargement.
 */
export const SUBSCRIPTION_PRESET_META: Record<
  SubscriptionPreset,
  { label: string; accent: string; icon: Glyph; logoUrl: string | null }
> = {
  custom: { label: 'Personnalisé', accent: '#8B8B8B', icon: 'apps-outline', logoUrl: null },
  netflix: {
    label: 'Netflix',
    accent: '#E50914',
    icon: 'play-circle',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/320px-Netflix_2015_logo.svg.png',
  },
  spotify: {
    label: 'Spotify',
    accent: '#1DB954',
    icon: 'musical-notes',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Spotify_logo_without_text.svg/320px-Spotify_logo_without_text.svg.png',
  },
  amazon_prime: {
    label: 'Amazon Prime',
    accent: '#00A8E1',
    icon: 'cart-outline',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/320px-Amazon_logo.svg.png',
  },
  disney: {
    label: 'Disney+',
    accent: '#113CCF',
    icon: 'film-outline',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Disney%2B_logo.svg/320px-Disney%2B_logo.svg.png',
  },
  youtube: {
    label: 'YouTube',
    accent: '#FF0000',
    icon: 'videocam-outline',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/320px-YouTube_full-color_icon_%282017%29.svg.png',
  },
  apple: {
    label: 'Apple',
    accent: '#A2AAAD',
    icon: 'cloud-outline',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/240px-Apple_logo_black.svg.png',
  },
  gym: { label: 'Sport / salle', accent: '#7A9E7A', icon: 'barbell-outline', logoUrl: null },
  phone: { label: 'Téléphone', accent: '#5c4a6b', icon: 'phone-portrait-outline', logoUrl: null },
  internet: { label: 'Internet', accent: '#4a6670', icon: 'wifi-outline', logoUrl: null },
  rent: { label: 'Loyer', accent: '#6b5a4a', icon: 'home-outline', logoUrl: null },
  electricity: { label: 'Électricité / eau', accent: '#c9a227', icon: 'flash-outline', logoUrl: null },
  insurance: { label: 'Assurance', accent: '#4a6b5a', icon: 'shield-checkmark-outline', logoUrl: null },
  other: { label: 'Autre', accent: '#948E89', icon: 'ellipsis-horizontal', logoUrl: null },
};

export const PRESET_ORDER: SubscriptionPreset[] = [
  'netflix',
  'spotify',
  'amazon_prime',
  'disney',
  'youtube',
  'apple',
  'gym',
  'phone',
  'internet',
  'rent',
  'electricity',
  'insurance',
  'other',
  'custom',
];
