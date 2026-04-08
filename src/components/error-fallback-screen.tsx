import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

type Props = {
  error: unknown;
  onReset: () => void;
};

export function ErrorFallbackScreen({ error, onReset }: Props) {
  const router = useRouter();
  const message =
    error instanceof Error ? error.message : String(error ?? 'Erreur inconnue');

  const goHome = () => {
    onReset();
    router.replace('/(app)/(tabs)');
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Ionicons name="warning-outline" size={48} color={colors.danger} />
        <Text style={styles.title}>Un problème est survenu</Text>
        <Text style={styles.body}>
          L’application a rencontré une erreur. Vos données restent sur cet appareil. Vous pouvez
          revenir à l’accueil et continuer à utiliser UCHUMI.
        </Text>
        {__DEV__ ? (
          <Text style={styles.dev} numberOfLines={6}>
            {message}
          </Text>
        ) : null}
        <Pressable
          style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
          onPress={goHome}>
          <Ionicons name="home" size={20} color={colors.textOnDark} />
          <Text style={styles.btnLabel}>Retour à l’accueil</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.marshland,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.dune,
    borderRadius: 20,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  dev: {
    fontSize: 12,
    color: colors.danger,
    alignSelf: 'stretch',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
    marginTop: spacing.sm,
  },
  pressed: { opacity: 0.9 },
  btnLabel: {
    color: colors.textOnDark,
    fontSize: 17,
    fontWeight: '800',
  },
});
