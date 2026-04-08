/** Historique local des notifications reçues (léger, pour l’écran Notifications). */
export type NotificationLogEntry = {
  id: string;
  title: string;
  body: string;
  receivedAt: string;
  /** Route Expo Router cible si l’utilisateur ouvre la notification. */
  href?: string;
};
