import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Initialise le SDK Google Mobile Ads (une fois au démarrage).
 * Inactif sur le web et dans Expo Go (pas de module natif fiable).
 */
export function initMobileAdsSdk(): void {
  if (Platform.OS === 'web') return;
  if (Constants.executionEnvironment === 'storeClient') return;

  try {
    // Chargement conditionnel pour ne pas casser Expo Go si le module est absent.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mobileAds = require('react-native-google-mobile-ads').default;
    void mobileAds().initialize();
  } catch {
    // Ignoré : build sans AdMob ou plateforme non supportée
  }
}
