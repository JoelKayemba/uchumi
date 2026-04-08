/** Types pour les variables Expo (injectées au build si EXPO_PUBLIC_*). */
declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_ADMOB_BANNER_ANDROID?: string;
    EXPO_PUBLIC_ADMOB_BANNER_IOS?: string;
    /** `1` = bandeau d’aperçu visuel (dev / Expo Go). */
    EXPO_PUBLIC_ADMOB_DEBUG_PREVIEW?: string;
    /** `1` = logs détaillés dans la console. */
    EXPO_PUBLIC_ADMOB_VERBOSE_LOGS?: string;
  }
}
