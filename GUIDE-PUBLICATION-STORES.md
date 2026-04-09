# Guide de publication — App Store & Google Play (UCHUMI)

Ce document décrit les étapes pour publier **UCHUMI** (Expo ~54, EAS Build). Adaptez les textes entre crochets `[…]` à votre cas réel.

---

## 0. Prérequis avant toute chose

| Élément | App Store (Apple) | Google Play |
|--------|---------------------|-------------|
| Compte payant | [Apple Developer Program](https://developer.apple.com/programs/) (~99 $/an) | [Compte développeur Google Play](https://play.google.com/console/signup) (~25 $ une fois) |
| Identité | Personne ou société (D-U-N-S si entreprise US/international parfois demandé) | Identité vérifiée selon les politiques Google |
| Machine / outils | Mac recommandé pour captures iOS ; Xcode optionnel si tout passe par EAS | Aucune contrainte OS particulière pour le binaire |

**À préparer une fois pour toutes (les deux stores) :**

- **Politique de confidentialité** : URL publique HTTPS (obligatoire si vous collectez des données ou utilisez des SDK tiers comme pub, analytics, etc.).
- **Adresse e-mail de support** visible par les utilisateurs.
- **Captures d’écran** : plusieurs tailles (voir sections dédiées).
- **Icône** : déjà dans le projet (`assets/images/icon.png` et variantes Android).
- **Version** : dans `app.json` → `expo.version` (ex. `1.0.0`) ; sur Android le `versionCode` est géré côté build (EAS `autoIncrement` en production).

**Important — identifiants d’app :**  
Vérifiez dans [App Store Connect](https://appstoreconnect.apple.com) et la console Play que le **Bundle ID iOS** et le **package Android** correspondent exactement à ceux configurés dans votre projet Expo (`app.config.js` / `app.json` via `ios.bundleIdentifier` et `android.package`). Si ce n’est pas encore défini, ajoutez-les avant le premier build de production.

---

## 1. Préparation technique (Expo / EAS)

### 1.1 Compte et projet EAS

1. Installer EAS CLI : `npm i -g eas-cli`
2. Connexion : `eas login`
3. Lier le projet : `eas build:configure` (si ce n’est pas déjà fait)

### 1.2 Credentials

- **iOS** : lors du premier build production, EAS peut créer/gérer certificats et profils, ou vous connecter un compte Apple Developer.
- **Android** : génération ou upload d’une **keystore** de production (EAS peut en créer une et la stocker de façon sécurisée — conservez une copie de secours si vous la gérez vous-même).

### 1.3 Builds de production

D’après `package.json` / `eas.json` :

```bash
# Build iOS + Android production (selon votre workflow habituel)
npm run eas:build:prod
# ou : eas build --profile production --platform all
```

- **Android** pour Play Store : **Android App Bundle (AAB)** — déjà le cas pour le profil `production` dans `eas.json`.
- **iOS** : archive pour App Store (EAS produit un `.ipa` ou soumet via `eas submit`).

### 1.4 Soumission automatique (optionnel)

```bash
eas submit --platform ios --latest
eas submit --platform android --latest
```

Configurez les secrets / comptes quand EAS le demande (clé API App Store Connect, compte de service Play, etc.).

### 1.5 Points spécifiques à UCHUMI (à déclarer honnêtement)

D’après `app.json`, l’app peut inclure :

- **Notifications** (`expo-notifications`)
- **Photos / caméra** (`expo-image-picker`) — textes de permission déjà en français
- **Publicités** (`react-native-google-mobile-ads`) — déclarez la présence de pubs et le framework **UMP / consentement** si applicable selon les règles Google et Apple
- **Authentification locale** possible (`expo-local-authentication`)

Ces éléments conditionnent les questionnaires **Confidentialité** (Apple) et **Sécurité des données** (Google).

---

## 2. Apple App Store — étapes et champs à remplir

### 2.1 App Store Connect — créer l’app

1. Aller sur [App Store Connect](https://appstoreconnect.apple.com) → **Mes apps** → **+** → **Nouvelle app**.
2. **Plateformes** : cocher **iOS** (et **iPadOS** si vous supportez les tablettes — `supportsTablet: true` dans votre config).
3. **Nom** : nom affiché sur le store (ex. `UCHUMI`).
4. **Langue principale** : ex. Français.
5. **Bundle ID** : choisir celui enregistré dans le Developer Portal (doit matcher l’app buildée).
6. **SKU** : identifiant interne unique (ex. `uchumi-ios-001`).
7. **Accès utilisateur** : **Accès complet** sauf cas particulier (app réservée à un compte entreprise).

### 2.2 Fiche App Store (informations sur l’app)

Remplir ou préparer :

| Champ | Contenu attendu |
|-------|-----------------|
| **Nom** (≤ 30 car.) | Nom commercial |
| **Sous-titre** (≤ 30 car.) | Accroche courte |
| **Texte promotionnel** (optionnel, 170 car.) | Mise en avant sans repasser en revue si changé seul |
| **Description** (≤ 4000 car.) | Fonctionnalités, public, ce que fait l’app |
| **Mots-clés** (≤ 100 car., séparés par virgules) | Termes de recherche (pas de noms de concurrents abusifs) |
| **URL assistance** | Page ou `mailto:` support |
| **URL marketing** (optionnel) | Site vitrine |
| **URL politique de confidentialité** | **Obligatoire** dans la plupart des cas |
| **Catégorie principale / secondaire** | Ex. **Finance** ou **Productivité** selon votre positionnement |
| **Classification du contenu** (questionnaire) | Violence, contenu adulte, achats intégrés, etc. — répondre au questionnaire Apple |
| **Copyright** | Ex. `2026 Votre Nom ou Société` |

### 2.3 Prix et disponibilité

- **Prix** : gratuit ou payant ; **achats intégrés** / **abonnements** si vous en avez (à configurer dans des sections dédiées).
- **Disponibilité** : pays / régions.
- **Taxes et accords** : accepter les contrats fiscaux / bancaires quand demandé.

### 2.4 Confidentialité de l’app (“App Privacy”)

1. Déclarer les **données collectées** (même via SDK tiers : pub, analytics, crash reporting comme Sentry si activé en prod, etc.).
2. Pour chaque type : finalité (analytics, pub, fonctionnalité…), lien avec l’utilisateur, suivi ou non.
3. Si vous utilisez **l’ID publicitaire (IDFA)** ou du tracking : respecter **ATT** (App Tracking Transparency) côté app si requis.

### 2.5 Version iOS (build à soumettre)

Pour chaque version (ex. 1.0.0) :

| Section | Action |
|---------|--------|
| **Build** | Attacher le build `.ipa` (upload via Transporter, Xcode, ou **EAS Submit**) |
| **Captures d’écran** | Obligatoires pour les tailles exigées par Apple (iPhone 6,7″, 6,5″, etc. — la liste exacte est dans App Store Connect et évolue ; suivez les emplacements “obligatoires” signalés en rouge) |
| **Texte “Quoi de neuf”** | Notes de version pour les utilisateurs |
| **Révision des dépenses** (si achats intégrés) | Captures et flux de test |

**Testeurs :**

- **TestFlight** : ajouter des testeurs internes/externes avant ou après la première approbation (externe = revue bêta parfois requise).

### 2.6 Questionnaire d’exportation / chiffrement (USA)

- Si l’app utilise uniquement le chiffrement standard HTTPS / système : souvent **exemption** — répondre au questionnaire dans App Store Connect lors de la soumission.

### 2.7 Soumettre pour examen

- Vérifier que **toutes** les sections obligatoires ont une coche verte.
- **Soumettre pour examen**.
- Délai typique : 24–48 h (variable).

---

## 3. Google Play Console — étapes et sélections

### 3.1 Créer l’application

1. [Google Play Console](https://play.google.com/console) → **Créer une application**.
2. **Nom de l’application** : ex. `UCHUMI`.
3. **Langue par défaut** : Français (France) ou autre.
4. **Application ou jeu** : **Application**.
5. **Gratuit ou payant** : choisir (modifiable avec contraintes).
6. Accepter les **déclarations** (Play Console).

### 3.2 Tableau de bord — compléter les tâches

Play guide par sections. Ordre logique :

#### A. Accès à l’application (si login requis)

- Si l’app nécessite un compte : fournir **identifiants de test** + instructions pour les examinateurs.

#### B. Fiche Play Store (liste principale)

| Élément | Détail |
|---------|--------|
| **Brève description** | ≤ 80 caractères |
| **Description complète** | ≤ 4000 caractères |
| **Graphismes** | Icône 512×512, **image de présentation** (feature graphic) 1024×500, captures (téléphone, 7″, 10″ tablette si requis) |
| **Vidéo** (optionnel) | Lien YouTube |
| **Catégorie** | Ex. **Finance** ou **Productivité** |
| **Coordonnées** | E-mail, site, téléphone optionnel |
| **Politique de confidentialité** | URL obligatoire si collecte de données ou permissions sensibles |

#### C. Classification du contenu (questionnaire IARC)

- Répondre au questionnaire (public, violence, argent réel, etc.) pour obtenir un **PEGI / équivalent**.

#### D. Public cible et contenu

- **Groupe d’âge** : qui est l’app destinée (enfants, familles, adultes) — impacte les obligations (Families Policy si enfants).
- **Actualités** : si l’app est une app d’actualités (souvent non pour une app finance perso).

#### E. Sécurité des données (Data safety)

Formulaire détaillé — aligné sur la réalité de l’app :

- Données **collectées** / **partagées** (y compris via SDK pub, analytics, Sentry…).
- **Chiffrement en transit**.
- **Suppression des données** possible ou non.
- **Pratiques requises** (ex. annonce de la collecte avant, lien politique de confidentialité).

**Sélections typiques à préparer :** types de données (localisation approximative, identifiants appareil, diagnostics, infos financières si pertinent, etc.), finalités, caractère obligatoire ou optionnel.

#### F. Applications gouvernementales (si concerné)

- Sinon : déclarer **non**.

#### G. Consentement des annonces (si publicités)

- Déclarer la présence d’**annonces** ; configurer selon les exigences **UMP** / consentement utilisateurs dans l’UE/EEE/UK si vous ciblez ces zones.

#### H. Autorisations déclarées (Play App Content)

- Justifier les **permissions** sensibles (stockage, caméra, etc.) dans la fiche ou les formulaires liés si demandé.

### 3.3 Version de production — Android App Bundle

1. Menu **Production** (ou test interne/fermé d’abord — recommandé).
2. **Créer une nouvelle version**.
3. Importer le **.aab** (build EAS production).
4. **Notes de version** : ce qui change pour l’utilisateur (obligatoire pour les mises à jour).

### 3.4 Signature de l’app

- Play utilise **Play App Signing** : la clé upload est celle utilisée pour signer l’AAB ; Google gère la clé de signature finale si vous activez le service (recommandé).

### 3.5 Examen de l’application

- Une fois toutes les sections **terminées**, bouton **Envoyer pour examen** (ou équivalent selon l’interface).
- Délai variable (souvent quelques heures à quelques jours).

---

## 4. Checklist rapide avant soumission

- [ ] `expo.version` (et éventuellement `ios.buildNumber` / versioning Android) cohérents avec ce que vous annoncez.
- [ ] Bundle ID / `applicationId` identiques aux fiches créées dans les consoles.
- [ ] Politique de confidentialité en ligne et à jour (contenu aligné avec privacy.tsx / pratiques réelles).
- [ ] Compte de test fourni si login obligatoire.
- [ ] Captures à jour, sans fausses promesses.
- [ ] Déclarations **Apple Privacy** et **Google Data Safety** cohérentes entre elles et avec le code (pub, Sentry, notifications, etc.).
- [ ] Test sur **appareil réel** iOS et Android (parcours critique + permissions).

---

## 5. Après publication

- Surveiller **crashs** (ex. Sentry), **avis** utilisateurs, et les **alertes** des consoles (rejet, politique, mise à jour cible API Android obligatoire, etc.).
- Pour les mises à jour : incrémenter la version, reconstruire avec EAS, soumettre une nouvelle version dans chaque console.

---

## 6. Ressources officielles (à consulter pour les détails à jour)

- [Documentation Expo — soumission aux stores](https://docs.expo.dev/submit/introduction/)
- [Apple — App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [Google Play — Guide de la console](https://support.google.com/googleplay/android-developer/)

---

*Document généré pour le projet **uchumi** (Expo, profil EAS `production`, AAB Android). Mettez à jour les URLs, identifiants légaux et textes marketing avant la mise en ligne.*
