import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/src/components/screen-header';
import { UchumiScreen } from '@/src/components/uchumi-screen';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <UchumiScreen style={styles.wrap}>
      <ScreenHeader title="Confidentialité" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.p}>
          <Text style={styles.bold}>Dernière mise à jour :</Text> application UCHUMI, données
          traitées localement sur votre appareil.
        </Text>

        <Text style={styles.h}>1. Principe</Text>
        <Text style={styles.p}>
          UCHUMI est conçue pour les jeunes et toute personne qui veut un suivi simple : vos
          mouvements, budgets, objectifs et préférences sont stockés
          <Text style={styles.bold}> sur votre téléphone</Text> (AsyncStorage), sans compte UCHUMI
          obligatoire et sans serveur central pour vos données financières.
        </Text>

        <Text style={styles.h}>2. Données collectées par l’app</Text>
        <Text style={styles.p}>
          Saisies que vous faites : montants, libellés, catégories, pièces jointes locales, exports
          que vous déclenchez vous-même. Rien n’est envoyé à nos serveurs pour le fonctionnement
          courant de l’app.
        </Text>

        <Text style={styles.h}>3. Internet</Text>
        <Text style={styles.p}>
          Certaines fonctions peuvent appeler des services publics (ex. taux de change, marchés)
          pour afficher des informations. Ces appels ne sont pas utilisés pour vous profiler au
          sens d’une publicité ciblée par UCHUMI.
        </Text>

        <Text style={styles.h}>4. Publicités</Text>
        <Text style={styles.p}>
          En build natif, des publicités peuvent affichées via Google AdMob. AdMob peut traiter des
          données techniques selon sa politique Google. Vous pouvez limiter la personnalisation
          dans les réglages du téléphone et du compte Google.
        </Text>

        <Text style={styles.h}>5. Observabilité (optionnel)</Text>
        <Text style={styles.p}>
          Si vous configurez un DSN Sentry (variable d’environnement), des erreurs techniques
          anonymisées peuvent être envoyées pour corriger les bugs. Sans configuration, rien n’est
          envoyé.
        </Text>

        <Text style={styles.h}>6. Vos droits</Text>
        <Text style={styles.p}>
          Vous pouvez supprimer les données locales dans Réglages (données locales), désinstaller
          l’app, ou exporter puis effacer vos données. Pour toute question :
          kayembajoel92@gmail.com
        </Text>

        <Text style={styles.h}>7. Contact</Text>
        <Text style={styles.p}>
          Pour toute question relative à cette politique : kayembajoel92@gmail.com
        </Text>
      </ScrollView>
    </UchumiScreen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: spacing.sm },
  scroll: { paddingHorizontal: spacing.md, gap: spacing.md },
  h: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  p: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
  },
  bold: { fontWeight: '800', color: colors.textPrimary },
});
