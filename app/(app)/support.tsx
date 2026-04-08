import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/src/components/screen-header';
import { UchumiScreen } from '@/src/components/uchumi-screen';
import { colors } from '@/src/theme';
import { spacing } from '@/src/theme/spacing';

const SUPPORT_EMAIL = 'kayembajoel92@gmail.com';

type FaqSection = { title: string; items: { q: string; a: string }[] };

const FAQ_SECTIONS: FaqSection[] = [
  {
    title: 'A — Présentation',
    items: [
      {
        q: "Qu'est-ce qu'UCHUMI ?",
        a: "UCHUMI est une application de gestion personnelle pour suivre vos revenus et dépenses, vos budgets, vos objectifs et vos charges récurrentes ou abonnements. Elle est pensée pour être simple, visuelle et adaptée à un usage quotidien, y compris pour les jeunes utilisateurs.",
      },
      {
        q: "Ai-je besoin d'un compte ou d'Internet pour le principal ?",
        a: "Aucun compte UCHUMI n'est obligatoire pour enregistrer vos opérations et consulter vos écrans. Une connexion peut être utile pour certaines informations affichées en ligne (par exemple des données publiques liées aux marchés), mais le cœur du suivi repose sur votre appareil.",
      },
      {
        q: "Où sont stockées mes données ?",
        a: "Vos saisies sont enregistrées sur votre téléphone ou tablette. Consultez la politique de confidentialité dans l'application pour le détail des engagements de l'éditeur.",
      },
    ],
  },
  {
    title: 'B — Premiers pas',
    items: [
      {
        q: "Que faire au premier lancement ?",
        a: "Suivez les écrans d'introduction si l'application les propose, choisissez votre mode d'utilisation si demandé, et définissez la devise qui vous convient le mieux dans les réglages. Vous pourrez ajuster tout cela plus tard.",
      },
      {
        q: "L'application demande les notifications : à quoi ça sert ?",
        a: "Les notifications permettent de recevoir des rappels (par exemple pour saisir une dépense ou être informé d'une échéance). Elles sont gérées sur l'appareil : acceptez ou refusez selon votre préférence ; vous pourrez modifier ce choix dans les réglages du téléphone et dans UCHUMI.",
      },
    ],
  },
  {
    title: 'C — Devises et montants',
    items: [
      {
        q: "Comment fonctionnent les devises ?",
        a: "Vous pouvez travailler avec plusieurs devises : chaque mouvement est enregistré dans la devise que vous choisissez. Les totaux et soldes peuvent être affichés par devise lorsque plusieurs sont utilisées, afin de refléter la réalité de vos comptes.",
      },
      {
        q: "Pourquoi je vois plusieurs montants pour le même type d'information ?",
        a: "Lorsque vous mélangez plusieurs devises, l'application affiche les montants dans leur devise d'origine plutôt que de tout fusionner en un seul chiffre qui serait trompeur sans taux de change officiels en temps réel.",
      },
    ],
  },
  {
    title: 'D — Mouvements et catégories',
    items: [
      {
        q: "Comment ajouter une dépense ou un revenu ?",
        a: "Utilisez le bouton ou l'entrée de menu prévu pour créer un nouveau mouvement, indiquez le montant, la date, la catégorie et la devise. Vous pouvez ajouter une note pour vous rappeler le contexte.",
      },
      {
        q: "Comment modifier ou supprimer un mouvement ?",
        a: "Ouvrez le mouvement depuis la liste ou le calendrier, puis utilisez les actions d'édition ou de suppression proposées à l'écran.",
      },
      {
        q: "Comment gérer les catégories ?",
        a: "Les réglages ou l'écran dédié aux catégories vous permettent d'ajouter, renommer ou organiser les catégories pour coller à votre façon de classer vos dépenses.",
      },
    ],
  },
  {
    title: 'E — Budgets',
    items: [
      {
        q: "À quoi servent les budgets par catégorie ?",
        a: "Ils vous aident à fixer un plafond ou une enveloppe pour certaines catégories (courses, loisirs, etc.) et à voir si vous restez dans vos limites sur la période choisie.",
      },
      {
        q: "Le budget se met-il à jour tout seul ?",
        a: "Il se met à jour en fonction des mouvements que vous enregistrez dans les catégories concernées.",
      },
    ],
  },
  {
    title: 'F — Objectifs d’épargne',
    items: [
      {
        q: "Comment créer un objectif ?",
        a: "Rendez-vous dans la partie objectifs du plan financier, créez un objectif avec un montant cible et une échéance si vous le souhaitez, puis enregistrez vos versements au fil du temps.",
      },
      {
        q: "La progression est-elle garantie ?",
        a: "L'application affiche l'avancement par rapport à ce que vous saisissez ; elle ne remplace pas un conseiller financier.",
      },
    ],
  },
  {
    title: 'G — Charges récurrentes',
    items: [
      {
        q: "Qu'est-ce qu'une charge récurrente ?",
        a: "C'est une dépense qui se répète (loyer, forfait, assurance, etc.). Vous pouvez la paramétrer pour qu'elle apparaisse selon la fréquence choisie et vous rappeler les échéances.",
      },
      {
        q: "Différence avec un abonnement ?",
        a: "Les abonnements sont souvent gérés dans un écran dédié avec des logos ou libellés prédéfinis ; les récurrences couvrent toute charge répétée que vous définissez vous-même.",
      },
    ],
  },
  {
    title: 'H — Abonnements',
    items: [
      {
        q: "Comment suivre Netflix, Spotify, etc. ?",
        a: "Ajoutez un abonnement depuis l'écran prévu, choisissez le service si disponible, le montant et la devise, ainsi que la périodicité. Les montants s'affichent dans la devise que vous avez indiquée, sans conversion automatique.",
      },
      {
        q: "Les prix sont-ils convertis dans une autre devise ?",
        a: "Non : le montant reste affiché dans la devise que vous avez saisie pour cet abonnement.",
      },
    ],
  },
  {
    title: 'I — Prêts',
    items: [
      {
        q: "Puis-je suivre un prêt ?",
        a: "Oui : enregistrez les informations du prêt dans la section prévue pour suivre le capital, les échéances ou le remboursement selon les options offertes par l'application.",
      },
    ],
  },
  {
    title: 'J — Portefeuille et soldes',
    items: [
      {
        q: "Comment lire mon solde disponible ?",
        a: "L'écran portefeuille résume ce qui est disponible selon vos mouvements enregistrés. Avec plusieurs devises, les montants peuvent être présentés par devise.",
      },
      {
        q: "Pourquoi mon solde ne correspond pas à ma banque ?",
        a: "UCHUMI reflète uniquement ce que vous saisissez. Les retards bancaires, les chèques non débités ou les opérations hors application ne sont pas inclus tant que vous ne les enregistrez pas.",
      },
    ],
  },
  {
    title: 'K — Plan financier et calendrier',
    items: [
      {
        q: "À quoi sert le plan financier ?",
        a: "C'est le hub pour accéder aux budgets, objectifs, récurrences, abonnements et vues d'ensemble de votre organisation financière.",
      },
      {
        q: "Le calendrier affiche quoi ?",
        a: "Il met en visibilité l'activité de vos mouvements sur les jours concernés pour repérer les pics de dépenses ou les oublis.",
      },
    ],
  },
  {
    title: 'L — Statistiques et tendances',
    items: [
      {
        q: "Comment interpréter les graphiques ?",
        a: "Ils synthétisent vos données saisies par période ou par catégorie. Ils aident à voir des tendances, pas à prédire l'avenir.",
      },
    ],
  },
  {
    title: 'M — Notifications',
    items: [
      {
        q: "Les rappels fonctionnent-ils quand l'app est fermée ?",
        a: "Les notifications planifiées sur l'appareil peuvent s'afficher même lorsque l'application n'est pas ouverte, si le système et vos réglages le permettent.",
      },
      {
        q: "Où voir l'historique des notifications ?",
        a: "Un centre de notifications dans l'application peut lister les rappels reçus ; le détail exact dépend de votre version et de votre système.",
      },
    ],
  },
  {
    title: 'N — Sauvegarde et restauration',
    items: [
      {
        q: "Comment sauvegarder mes données ?",
        a: "Utilisez les fonctions d'export dans les réglages pour générer une copie de vos données que vous pourrez conserver où vous voulez (messagerie, cloud personnel, etc.).",
      },
      {
        q: "Puis-je importer une sauvegarde ?",
        a: "Si l'application propose l'import, suivez l'assistant depuis les réglages. Vérifiez toujours la source du fichier avant de l'importer.",
      },
      {
        q: "Comment tout effacer ?",
        a: "La désinstallation de l'application supprime en général les données locales sur l'appareil. Pour une copie avant suppression, exportez vos données depuis les réglages.",
      },
    ],
  },
  {
    title: 'O — Confidentialité',
    items: [
      {
        q: "Mes données sont-elles vendues ?",
        a: "UCHUMI n'est pas conçue pour revendre vos données financières saisies localement. Pour le détail juridique, lisez la politique de confidentialité dans l'application.",
      },
    ],
  },
  {
    title: 'P — Problèmes courants',
    items: [
      {
        q: "L'application se ferme ou affiche une erreur",
        a: "Redémarrez l'application, vérifiez que votre système est à jour, et mettez à jour UCHUMI depuis le store. Si le problème continue, écrivez au support avec le modèle de téléphone et la version de l'app.",
      },
      {
        q: "Je ne reçois pas les notifications",
        a: "Vérifiez les autorisations dans les réglages du téléphone, le mode Ne pas déranger, et les options de rappels dans UCHUMI.",
      },
      {
        q: "Un montant semble faux",
        a: "Contrôlez la devise du mouvement, la date et la catégorie. Une même opération saisie deux fois doublera l'effet sur les totaux.",
      },
    ],
  },
  {
    title: 'Q — Contact',
    items: [
      {
        q: "Comment joindre le support ?",
        a: `Utilisez le bouton e-mail sur cette page : ${SUPPORT_EMAIL}. Décrivez votre situation en une phrase claire et joignez une capture d'écran si utile (sans données bancaires sensibles).`,
      },
      {
        q: "Délai de réponse",
        a: "Nous lisons les messages dans la mesure du possible ; il n'y a pas de garantie de délai, mais les retours servent à améliorer l'application.",
      },
    ],
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
          Retrouvez ici les réponses aux questions les plus fréquentes, de A à Z. Pour un cas
          précis, écrivez-nous : nous lisons les messages pour faire évoluer UCHUMI.
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

        <Text style={styles.faqIntro}>
          FAQ complète — parcourir les sections ci-dessous (A à Q).
        </Text>

        {FAQ_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, i) => (
              <View key={`${section.title}-${i}`} style={styles.faqBlock}>
                <Text style={styles.faqQ}>{item.q}</Text>
                <Text style={styles.faqA}>{item.a}</Text>
              </View>
            ))}
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
  faqIntro: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  section: { gap: spacing.sm },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.accent,
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
  faqQ: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  faqA: { fontSize: 14, lineHeight: 21, color: colors.textSecondary },
  pressed: { opacity: 0.92 },
});
