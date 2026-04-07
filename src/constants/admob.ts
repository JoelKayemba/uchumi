/**
 * AdMob — production
 *
 * 1) App ID (avec ~) : déjà dans app.json → plugin react-native-google-mobile-ads.
 * 2) Unités bannière (avec /) : EXPO_PUBLIC_ADMOB_BANNER_ANDROID et EXPO_PUBLIC_ADMOB_BANNER_IOS.
 *
 * Créer une bannière (console Google AdMob) :
 * - Applications → [ton app] → Blocs publicitaires → Ajouter un bloc → Bannière.
 * - Une unité par plateforme (Android / iOS) ou une unité « multi-plateforme » selon l’UI AdMob.
 * - Copier l’ID du bloc : ca-app-pub-XXXXXXXX/YYYYYYYYYY (pas le même format que l’App ID ~).
 *
 * Local : copier .env.example → .env, coller les deux IDs, puis build (les variables EXPO_PUBLIC_ sont figées au build).
 *
 * EAS (build cloud) : https://expo.dev → ton projet → Environment variables → Production
 *   EXPO_PUBLIC_ADMOB_BANNER_ANDROID = …
 *   EXPO_PUBLIC_ADMOB_BANNER_IOS = …
 * Puis : npx eas build --profile production --platform android (ou ios / all)
 *
 * Ne publiez jamais l’app store avec uniquement les IDs de test Google.
 */
