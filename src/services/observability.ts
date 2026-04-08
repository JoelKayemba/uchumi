import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

/**
 * Initialisation optionnelle : définir EXPO_PUBLIC_SENTRY_DSN dans .env (projet Sentry).
 * Sans DSN, rien n’est envoyé — l’app reste 100 % locale.
 */
export function initObservability(): void {
  if (Platform.OS === 'web' || !dsn) return;
  Sentry.init({
    dsn,
    enabled: !__DEV__,
    debug: __DEV__,
  });
}

export function reportException(error: unknown, context?: Record<string, string>): void {
  if (Platform.OS === 'web' || !dsn) {
    if (__DEV__) console.error('[UCHUMI]', error, context);
    return;
  }
  Sentry.captureException(error, { extra: context });
}

export { Sentry };
