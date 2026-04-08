import Ionicons from '@expo/vector-icons/Ionicons';

import type { SubscriptionPreset } from '@/src/types/subscription';

type Glyph = keyof typeof Ionicons.glyphMap;

/**
 * Logos : PNG Wikimedia (réseau requis au premier affichage, puis cache).
 * Icône de secours si échec de chargement.
 */
export const SUBSCRIPTION_PRESET_META: Record<
  SubscriptionPreset,
  {
    label: string;
    accent: string;
    icon: Glyph;
    logoUrl: string | null;
    logoAsset?: number;
  }
> = {
  custom: { label: 'Personnalisé', accent: '#8B8B8B', icon: 'apps-outline', logoUrl: null },
  netflix: {
    label: 'Netflix',
    accent: '#E50914',
    icon: 'play-circle',
    logoUrl: null,
    logoAsset: require('@/assets/abonnement/netflix.png'),
  },
  spotify: {
    label: 'Spotify',
    accent: '#1DB954',
    icon: 'musical-notes',
    logoUrl: null,
    logoAsset: require('@/assets/abonnement/spotify.png'),
  },
  amazon_prime: {
    label: 'Amazon Prime',
    accent: '#00A8E1',
    icon: 'cart-outline',
    logoUrl: null,
    logoAsset: require('@/assets/abonnement/amazon.png'),
  },
  canva: {
    label: 'Canva',
    accent: '#00C4CC',
    icon: 'color-palette-outline',
    logoUrl: null,
    logoAsset: require('@/assets/abonnement/canva.png'),
  },
  chatgpt: {
    label: 'ChatGPT',
    accent: '#10A37F',
    icon: 'sparkles-outline',
    logoUrl: null,
    logoAsset: require('@/assets/abonnement/chatgpt.png'),
  },
  disney: {
    label: 'Disney+',
    accent: '#113CCF',
    icon: 'film-outline',
    logoUrl: null,
    logoAsset: require('@/assets/abonnement/plus.png'),
  },
  youtube: {
    label: 'YouTube',
    accent: '#FF0000',
    icon: 'videocam-outline',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/320px-YouTube_full-color_icon_%282017%29.svg.png',
  },
  apple: {
    label: 'Apple Musique',
    accent: '#A2AAAD',
    icon: 'cloud-outline',
    logoUrl: null,
    logoAsset: require('@/assets/abonnement/musique.png'),
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
  'canva',
  'chatgpt',
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
