import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/src/components/screen-header';
import { UchumiScreen } from '@/src/components/uchumi-screen';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

const SUPPORT_EMAIL = 'kayembajoel92@gmail.com';

const FAQ = [
  {
    q: 'Mes données sont-elles sur un serveur ?',
    a: 'Non. UCHUMI fonctionne en local sur votre téléphone : pas de compte obligatoire, pas de cloud UCHUMI. Vous pouvez exporter une copie (JSON) depuis les Réglages.',
  },
  {
    q: 'Comment libérer de l’espace ?',
    a: 'Dans Réglages → Données locales, vous pouvez supprimer les mouvements, les budgets, les récurrences, etc., ou tout réinitialiser d’un coup (sans quitter l’app).',
  },
  {
    q: 'Les notifications fonctionnent-elles app fermée ?',
    a: 'Oui, ce sont des notifications locales planifiées sur l’appareil, si vous avez autorisé les notifications dans les réglages du téléphone.',
  },
  {
    q: 'Comment signaler un bug ?',
    a: 'Écrivez-nous par e-mail : nous lisons les retours pour améliorer l’app (léger et pensée pour les jeunes).',
  },
];

export default function SupportScreen() {
  const insets = useSafeAreaInsets();

  const openMail = () => {
    void Linking.openURL(
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('UCHUMI — support')}`
    );
  };

  return (
    <UchumiScreen style={styles.wrap}>
      <ScreenHeader title="Aide & contact" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.lead}>
          UCHUMI est une app légère et locale pour suivre son argent au quotidien.
        </Text>

        <Pressable
          style={({ pressed }) => [styles.mailCard, pressed && styles.pressed]}
          onPress={openMail}>
          <Ionicons name="mail" size={28} color={colors.accent} />
          <View style={styles.mailText}>
            <Text style={styles.mailLabel}>Écrire au support</Text>
            <Text style={styles.mailAddr}>{SUPPORT_EMAIL}</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
        </Pressable>

        <Text style={styles.faqTitle}>FAQ</Text>
        {FAQ.map((item, i) => (
          <View key={i} style={styles.faqBlock}>
            <Text style={styles.faqQ}>{item.q}</Text>
            <Text style={styles.faqA}>{item.a}</Text>
          </View>
        ))}
      </ScrollView>
    </UchumiScreen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: spacing.sm },
  scroll: { paddingHorizontal: spacing.md, gap: spacing.md },
  lead: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  mailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.dune,
    borderRadius: 16,
    padding: spacing.md + 4,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
  },
  mailText: { flex: 1 },
  mailLabel: { fontSize: 12, fontWeight: '800', color: colors.textMuted },
  mailAddr: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  faqTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  faqBlock: {
    backgroundColor: colors.dune,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.fuscousGray,
    gap: spacing.sm,
  },
  faqQ: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  faqA: { fontSize: 14, lineHeight: 20, color: colors.textSecondary },
  pressed: { opacity: 0.92 },
});
