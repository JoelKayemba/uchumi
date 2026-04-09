import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

/** Hauteur réservée minimale (bannière standard ~50dp + libellé). */
export const AD_BANNER_SLOT_MARGIN_TOP = spacing.md;

const LOG_PREFIX = '[UCHUMI AdMob]';

function adLog(message: string, data?: unknown): void {
  const verbose =
    __DEV__ || process.env.EXPO_PUBLIC_ADMOB_VERBOSE_LOGS === '1';
  if (!verbose) return;
  if (data !== undefined) {
    console.log(`${LOG_PREFIX} ${message}`, data);
  } else {
    console.log(`${LOG_PREFIX} ${message}`);
  }
}

/** Bandeau visuel type « image test » (dev uniquement, désactiver avec EXPO_PUBLIC_ADMOB_DEBUG_PREVIEW=0). */
function showVisualPreview(): boolean {
  if (!__DEV__) return false;
  return process.env.EXPO_PUBLIC_ADMOB_DEBUG_PREVIEW !== '0';
}

function AdSlotVisualMock({ reason }: { reason: string }) {
  return (
    <View style={styles.mockWrap}>
      <LinearGradient
        colors={['#FFFFFF', '#F0F0F5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.mockBanner}>
        <View style={styles.mockIconCircle}>
          <Ionicons name="images-outline" size={22} color={colors.ink} />
        </View>
        <View style={styles.mockTextCol}>
          <Text style={styles.mockTitle}>Image test — emplacement pub</Text>
          <Text style={styles.mockSub}>
            ~50 pt de haut · même zone que la bannière AdMob
          </Text>
          <Text style={styles.mockReason}>{reason}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

let adsModule: typeof import('react-native-google-mobile-ads') | null = null;

function getAdsModule(): typeof import('react-native-google-mobile-ads') | null {
  if (adsModule) return adsModule;
  if (Platform.OS === 'web') return null;
  if (Constants.executionEnvironment === 'storeClient') return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    adsModule = require('react-native-google-mobile-ads');
    return adsModule;
  } catch {
    return null;
  }
}

export function canUseNativeAdMob(): boolean {
  return getAdsModule() != null;
}

/**
 * Dev : IDs de test Google. Prod : uniquement les unités définies dans .env / EAS (jamais les test IDs).
 */
function resolveBannerUnitId(testBannerId: string): string {
  if (__DEV__) return testBannerId;
  const fromEnv =
    Platform.OS === 'android'
      ? process.env.EXPO_PUBLIC_ADMOB_BANNER_ANDROID
      : process.env.EXPO_PUBLIC_ADMOB_BANNER_IOS;
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv.trim();
  return '';
}

function Placeholder({
  detail,
  previewReason,
  compactTop,
}: {
  detail?: string;
  previewReason: string;
  compactTop?: boolean;
}) {
  useEffect(() => {
    adLog(`Placeholder affiché — ${previewReason}`, {
      executionEnvironment: Constants.executionEnvironment,
      platform: Platform.OS,
    });
  }, [previewReason]);

  return (
    <View
      style={[
        styles.placeholderOuter,
        compactTop && styles.slotCompactTop,
      ]}
      accessibilityLabel="Espace publicitaire">
      <Text style={styles.kicker}>Sponsorisé</Text>
      {showVisualPreview() ? (
        <AdSlotVisualMock reason={previewReason} />
      ) : null}
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText} numberOfLines={2}>
          Espace reserve pour les sponsorings.
        </Text>
      </View>
    </View>
  );
}

type AdBannerSlotProps = {
  /** Message court sous le bandeau réservé (Expo Go, erreur, etc.). */
  placeholderDetail?: string;
  /** Réduit la marge du haut (ex. juste sous le hero « Portefeuille » sur l’accueil). */
  compactTop?: boolean;
};

/**
 * Emplacement bannière Google AdMob (scroll / pied de liste).
 * Expo Go : emplacement visuel + message. Build natif : vraie pub (IDs de test en dev).
 */
export function AdBannerSlot({ placeholderDetail, compactTop }: AdBannerSlotProps) {
  const [failed, setFailed] = useState(false);

  const onFailed = useCallback((error: Error) => {
    adLog('onAdFailedToLoad', {
      message: error?.message ?? String(error),
      name: error?.name,
    });
    setFailed(true);
  }, []);

  const onLoaded = useCallback(
    (dimensions: { width: number; height: number }) => {
      adLog('onAdLoaded — bannière chargée', dimensions);
    },
    []
  );

  const onOpened = useCallback(() => {
    adLog('onAdOpened — pub visible / interaction');
  }, []);

  const mod = getAdsModule();
  const unitIdPreview = mod
    ? resolveBannerUnitId(mod.TestIds.BANNER)
    : '';

  useEffect(() => {
    if (!mod || failed) return;
    adLog('BannerAd monté', {
      unitId: unitIdPreview ? `${unitIdPreview.slice(0, 12)}…` : '(vide)',
      __DEV__,
      platform: Platform.OS,
    });
  }, [mod, failed, unitIdPreview]);

  if (!mod || failed) {
    const detail =
      placeholderDetail ??
      (Constants.executionEnvironment === 'storeClient'
        ? 'Expo Go ne charge pas AdMob. Utilisez un dev client (ex. eas build) ou un build store.'
        : undefined);
    return (
      <Placeholder
        detail={detail}
        compactTop={compactTop}
        previewReason={
          !mod
            ? 'SDK non chargé (Expo Go ou web)'
            : 'Chargement de la pub échoué (voir logs)'
        }
      />
    );
  }

  const { BannerAd, BannerAdSize, TestIds } = mod;
  const unitId = resolveBannerUnitId(TestIds.BANNER);

  if (!unitId) {
    return (
      <Placeholder
        detail="Production : ajoutez EXPO_PUBLIC_ADMOB_BANNER_ANDROID et EXPO_PUBLIC_ADMOB_BANNER_IOS (.env + variables EAS), puis rebuild."
        compactTop={compactTop}
        previewReason="Pas d’ID d’unité en production"
      />
    );
  }

  return (
    <View style={[styles.wrap, compactTop && styles.slotCompactTop]}>
      <Text style={styles.kicker}>Sponsorisé</Text>
      {showVisualPreview() ? (
        <Text style={styles.devHint}>
          (dev) Logs dans la console · bannière réelle sous ce texte si le SDK répond
        </Text>
      ) : null}
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.BANNER}
        onAdLoaded={onLoaded}
        onAdFailedToLoad={onFailed}
        onAdOpened={onOpened}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: AD_BANNER_SLOT_MARGIN_TOP,
    alignItems: 'center',
    width: '100%',
  },
  slotCompactTop: {
    marginTop: 0,
  },
  kicker: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  devHint: {
    alignSelf: 'stretch',
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 6,
    fontStyle: 'italic',
  },
  placeholderOuter: {
    width: '100%',
    marginTop: AD_BANNER_SLOT_MARGIN_TOP,
  },
  placeholder: {
    width: '100%',
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    backgroundColor: 'rgba(0,0,0,0.04)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
    textAlign: 'center',
  },
  mockWrap: {
    width: '100%',
    marginBottom: spacing.sm,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  mockBanner: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  mockIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockTextCol: {
    flex: 1,
  },
  mockTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  mockSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  mockReason: {
    fontSize: 10,
    color: colors.accent,
    marginTop: 4,
    fontWeight: '600',
  },
});
