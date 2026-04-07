import Constants from 'expo-constants';
import { useCallback, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

/** Hauteur réservée minimale (bannière standard ~50dp + libellé). */
export const AD_BANNER_SLOT_MARGIN_TOP = spacing.md;

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

function Placeholder({ detail }: { detail?: string }) {
  return (
    <View
      style={styles.placeholder}
      accessibilityLabel="Espace publicitaire">
      <Text style={styles.kicker}>Sponsorisé</Text>
      <Text style={styles.placeholderText} numberOfLines={3}>
        {detail ??
          'Espace réservé — bannière AdMob (identique en production une fois le build configuré).'}
      </Text>
    </View>
  );
}

type AdBannerSlotProps = {
  /** Message court sous le bandeau réservé (Expo Go, erreur, etc.). */
  placeholderDetail?: string;
};

/**
 * Emplacement bannière Google AdMob (scroll / pied de liste).
 * Expo Go : emplacement visuel + message. Build natif : vraie pub (IDs de test en dev).
 */
export function AdBannerSlot({ placeholderDetail }: AdBannerSlotProps) {
  const [failed, setFailed] = useState(false);
  const onFailed = useCallback(() => setFailed(true), []);

  const mod = getAdsModule();
  if (!mod || failed) {
    const detail =
      placeholderDetail ??
      (Constants.executionEnvironment === 'storeClient'
        ? 'Expo Go ne charge pas AdMob. Utilisez un dev client (ex. eas build) ou un build store.'
        : undefined);
    return <Placeholder detail={detail} />;
  }

  const { BannerAd, BannerAdSize, TestIds } = mod;
  const unitId = resolveBannerUnitId(TestIds.BANNER);

  if (!unitId) {
    return (
      <Placeholder
        detail="Production : ajoutez EXPO_PUBLIC_ADMOB_BANNER_ANDROID et EXPO_PUBLIC_ADMOB_BANNER_IOS (.env + variables EAS), puis rebuild."
      />
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>Sponsorisé</Text>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.BANNER}
        onAdFailedToLoad={onFailed}
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
  kicker: {
    alignSelf: 'flex-start',
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  placeholder: {
    width: '100%',
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(0,0,0,0.25)',
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
});
