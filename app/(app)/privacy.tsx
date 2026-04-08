import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/src/components/screen-header';
import { UchumiScreen } from '@/src/components/uchumi-screen';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

const LAST_UPDATE = '8 avril 2026';

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <UchumiScreen style={styles.wrap}>
      <ScreenHeader title="Politique de confidentialité" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          La présente politique décrit comment l’application UCHUMI respecte votre vie privée et
          traite les informations liées à votre usage. Elle s’adresse à tous les utilisateurs,
          notamment aux jeunes utilisateurs et à leurs accompagnants.
        </Text>

        <Text style={styles.meta}>
          <Text style={styles.bold}>Dernière mise à jour :</Text> {LAST_UPDATE}
        </Text>

        <Text style={styles.h}>1. Notre engagement</Text>
        <Text style={styles.p}>
          UCHUMI a été conçue pour vous aider à suivre votre argent au quotidien de façon simple. Nous
          appliquons le principe de minimisation : seules les données nécessaires au bon
          fonctionnement de l’application sur votre appareil sont concernées, et elles restent en
          priorité sous votre contrôle direct.
        </Text>

        <Text style={styles.h}>2. Responsable du traitement</Text>
        <Text style={styles.p}>
          L’éditeur de l’application UCHUMI est joignable pour toute question relative à cette
          politique ou à vos données à l’adresse suivante :{' '}
          <Text style={styles.bold}>kayembajoel92@gmail.com</Text>
        </Text>

        <Text style={styles.h}>3. Données traitées et finalités</Text>
        <Text style={styles.p}>
          L’application permet d’enregistrer et d’organiser des informations que vous saisissez
          vous-même : par exemple montants, libellés, catégories, notes, objectifs d’épargne,
          rappels de charges ou d’abonnements, et préférences d’affichage (comme la devise
          principale). Ces éléments servent uniquement à vous fournir les fonctionnalités de suivi,
          de planification et de rappels que vous activez dans l’app.
        </Text>

        <Text style={styles.h}>4. Stockage local et absence de compte obligatoire</Text>
        <Text style={styles.p}>
          UCHUMI ne vous impose pas de créer un compte pour utiliser les fonctions essentielles. Les
          données liées à votre suivi financier sont enregistrées sur votre téléphone ou tablette,
          afin que vous puissiez consulter et modifier vos informations sans dépendre d’un espace
          de stockage central géré par nous pour ce cœur de fonctionnalité.
        </Text>
        <Text style={styles.p}>
          Vous pouvez, si vous le souhaitez, créer une copie de vos données via les options
          d’export proposées dans les réglages, afin de les conserver ou les transférer selon vos
          besoins.
        </Text>

        <Text style={styles.h}>5. Contenu affiché et connexion réseau</Text>
        <Text style={styles.p}>
          Certaines informations affichées à l’écran (par exemple des indications liées aux marchés
          ou des données publiques utiles à la compréhension de vos soldes) peuvent être obtenues
          via Internet lorsque vous utilisez ces parties de l’application. Ces consultations ne
          visent pas à établir un profil publicitaire personnalisé au nom d’UCHUMI.
        </Text>

        <Text style={styles.h}>6. Publicités</Text>
        <Text style={styles.p}>
          Sur les versions de l’application qui intègrent de la publicité, des partenaires
          techniques (par exemple Google via son réseau publicitaire) peuvent être sollicités pour
          afficher des annonces. Ces partenaires appliquent leurs propres règles de confidentialité et
          de cookies ou identifiants. Vous pouvez ajuster les paramètres de confidentialité et de
          personnalisation des publicités dans les réglages de votre appareil et de votre compte
          associé au fournisseur concerné.
        </Text>

        <Text style={styles.h}>7. Amélioration de la stabilité (optionnel)</Text>
        <Text style={styles.p}>
          Afin d’identifier et de corriger les dysfonctionnements, une version de l’application
          peut être configurée pour envoyer des rapports d’erreur très limités et anonymisés vers un
          service tiers dédié à la qualité logicielle. Si cette option n’est pas activée par
          l’éditeur pour votre build, aucun tel envoi n’a lieu. Ces rapports ne sont pas utilisés
          pour du profilage marketing.
        </Text>

        <Text style={styles.h}>8. Durée de conservation</Text>
        <Text style={styles.p}>
          Les données conservées sur votre appareil le restent tant que vous conservez
          l’application et ne les effacez pas. La désinstallation de l’application entraîne en
          général la suppression des données associées sur l’appareil, selon le système
          d’exploitation.
        </Text>

        <Text style={styles.h}>9. Vos droits</Text>
        <Text style={styles.p}>
          Selon le droit applicable (notamment le Règlement général sur la protection des données
          dans l’Union européenne), vous pouvez disposer d’un droit d’accès, de rectification,
          d’effacement, de limitation, d’opposition et de portabilité lorsque ces droits sont
          applicables aux traitements concernés.
        </Text>
        <Text style={styles.p}>
          Pour exercer vos droits ou poser une question : écrivez à{' '}
          <Text style={styles.bold}>kayembajoel92@gmail.com</Text>. Pour les données stockées
          localement, l’export depuis l’application et la gestion des contenus sur l’appareil sont
          les moyens les plus directs d’accéder à vos informations ou de les supprimer.
        </Text>

        <Text style={styles.h}>10. Mineurs et public jeune</Text>
        <Text style={styles.p}>
          UCHUMI s’adresse notamment à un public jeune souhaitant apprendre à gérer son budget. Nous
          encourageons les mineurs à utiliser l’application avec le soutien d’un parent ou tuteur
          légal lorsque cela est pertinent. Nous ne sollicitons pas sciemment de données
          personnelles auprès d’enfants en dehors de ce cadre.
        </Text>

        <Text style={styles.h}>11. Sécurité et bonnes pratiques</Text>
        <Text style={styles.p}>
          Nous vous recommandons de protéger votre appareil par un code, une empreinte ou une
          reconnaissance faciale, et de ne pas partager des captures d’écran contenant des
          informations sensibles. Toute sauvegarde que vous exportez doit être stockée de façon
          sécurisée de votre côté.
        </Text>

        <Text style={styles.h}>12. Modifications</Text>
        <Text style={styles.p}>
          Cette politique peut être mise à jour pour refléter l’évolution de l’application ou des
          obligations légales. La date de « dernière mise à jour » en tête de document sera ajustée
          en conséquence. Nous vous invitons à la consulter régulièrement.
        </Text>

        <Text style={styles.h}>13. Contact</Text>
        <Text style={styles.p}>
          Pour toute question relative à la confidentialité ou à cette politique :{' '}
          <Text style={styles.bold}>kayembajoel92@gmail.com</Text>
        </Text>
      </ScrollView>
    </UchumiScreen>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, paddingTop: spacing.sm },
  scroll: { paddingHorizontal: spacing.md, gap: spacing.md },
  intro: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  meta: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
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
