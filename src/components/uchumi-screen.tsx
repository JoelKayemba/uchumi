import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

type UchumiScreenProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export function UchumiScreen({ children, style }: UchumiScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={[styles.inner, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.marshland,
  },
  inner: {
    flex: 1,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.marshland,
  },
});
