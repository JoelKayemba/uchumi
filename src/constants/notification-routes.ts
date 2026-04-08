/**
 * Cibles de navigation au tap sur une notification (data.href).
 * Chemins Expo Router (app/(app)/…).
 */
export const NOTIF_HREF = {
  home: '/(app)/(tabs)',
  newMovement: '/transaction/new',
  settings: '/settings',
  subscriptions: '/plan/subscriptions',
  pastInsights: '/insights/past-expenses',
  upcomingInsights: '/insights/upcoming-expenses',
} as const;
