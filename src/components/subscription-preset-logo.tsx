import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SUBSCRIPTION_PRESET_META } from '@/src/constants/subscription-presets';
import type { SubscriptionPreset } from '@/src/types/subscription';

type Props = {
  preset: SubscriptionPreset;
  size?: number;
};

export function SubscriptionPresetLogo({ preset, size = 52 }: Props) {
  const meta = SUBSCRIPTION_PRESET_META[preset];
  const [failed, setFailed] = useState(false);
  const url = meta.logoUrl;
  const source = meta.logoAsset ?? (url ? { uri: url } : null);

  if (!source || failed) {
    return (
      <View
        style={[
          styles.fallback,
          { width: size, height: size, borderRadius: size * 0.27 },
          { backgroundColor: meta.accent + '33' },
        ]}>
        <Ionicons name={meta.icon} size={size * 0.48} color={meta.accent} />
      </View>
    );
  }

  return (
    <Image
      source={source}
      style={{ width: size, height: size, borderRadius: size * 0.27 }}
      contentFit="contain"
      transition={120}
      onError={() => setFailed(true)}
      accessibilityLabel={meta.label}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
