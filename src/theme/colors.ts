/**
 * Palette UCHUMI — thème clair type soft UI (fond lavande, cartes blanches, noir + vert).
 */
export const colors = {
  /** Fond écran principal (lavande très clair) */
  marshland: '#F5F3FA',
  /** Surfaces cartes / modales */
  dune: '#FFFFFF',
  /** Bordures légères */
  fuscousGray: '#E8E6EF',
  naturalGray: '#C7C4D1',
  tapa: '#9A97A8',
  /** Texte */
  textPrimary: '#000000',
  textSecondary: '#5C5C5C',
  textMuted: '#8E8E93',
  /** Texte sur fond sombre (dégradés, héros, boutons foncés) */
  textOnDark: '#FFFFFF',
  textOnDarkSecondary: 'rgba(255,255,255,0.88)',
  textOnDarkMuted: 'rgba(255,255,255,0.62)',
  /** Accents (vert vif type référence) */
  accent: '#2ECC71',
  danger: '#E85D4C',
  success: '#2ECC71',
  /** Vert citron — dashboard type « fitness » (carte mise en avant) */
  lime: '#B3E67A',
  limeDark: '#8BC34A',
  limeMuted: '#E8F5D4',
  /** Abonnements — carte « prochaine échéance » */
  subscriptionPurple: '#6338F2',
  subscriptionPurpleLight: '#8B5CF6',
  subscriptionCardMuted: '#F3F0FA',
  /** Cartes synthèse type « Activité » */
  lavenderCard: '#EDE8FF',
  /** Noir pur (boutons, tab flottant) */
  ink: '#000000',
} as const;

export type ColorName = keyof typeof colors;
