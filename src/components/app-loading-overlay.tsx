import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/src/theme';

const LOGO = require('../../assets/logo/MODEL2.png');

type Props = { visible: boolean };

export function AppLoadingOverlay({ visible }: Props) {
  if (!visible) return null;
  return (
    <View style={styles.overlay} pointerEvents="auto">
      <Image source={LOGO} style={styles.logo} contentFit="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.marshland,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  logo: {
    width: 200,
    height: 200,
  },
});
