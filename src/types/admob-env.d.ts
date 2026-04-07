/** Types pour les variables Expo (injectées au build si EXPO_PUBLIC_*). */
declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_ADMOB_BANNER_ANDROID?: string;
    EXPO_PUBLIC_ADMOB_BANNER_IOS?: string;
  }
}
