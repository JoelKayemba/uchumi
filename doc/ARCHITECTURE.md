# UCHUMI — Architecture technique du projet

Stack **Expo uniquement** : **Expo SDK** (ex. ~54), **Expo Router**, **TypeScript**, composants et écrans en **`.tsx`**. Pas de projet React Native CLI séparé : on reste dans l’écosystème Expo (dev client, builds EAS si besoin plus tard).

---

## 1. Conventions de fichiers

| Fichier | Extension | Usage |
|--------|-----------|--------|
| Composants UI, écrans | `.tsx` | Tout ce qui contient du JSX React. |
| Hooks, utilitaires, types, store | `.ts` | Pas de JSX. |
| Routes Expo Router | `.tsx` | `app/_layout.tsx`, `app/**/*.tsx`. |

Point d’entrée géré par Expo : `main` dans `package.json` pointe vers **`expo-router/entry`** (ou équivalent selon version).

---

## 2. Socle déjà en place

- **expo**, **expo-router** : navigation fichier = routes.  
- **react-native**, **react-native-reanimated**, **react-native-gesture-handler**, **react-native-screens**, **react-native-safe-area-context** : alignés sur les versions supportées par votre SDK Expo.  
- **Metro** : via `npx expo start`.  
- **Lint** : `npm run lint` / `expo lint`.

Pour les paquets avec code natif, utiliser **`npx expo install <paquet>`** afin de respecter les versions compatibles avec le SDK.

---

## 3. Paquets à installer (Expo)

Toujours depuis la racine du projet `uchumi/` :

### État global (store)

```bash
npx expo install zustand
```

- **Zustand** + middleware **persist** + AsyncStorage (section 5).

### Persistance locale

```bash
npx expo install @react-native-async-storage/async-storage
```

- **AsyncStorage** : persistance JSON (transactions, catégories, préférences, store persisté).  
- Option plus tard : **MMKV** avec **development build** (Expo prebuild / dev client) si vous avez besoin de perf maximale — pas nécessaire pour démarrer.

### Notifications

```bash
npx expo install expo-notifications expo-device
```

- **expo-notifications** : notifications locales (alertes fond faible, rappels).  
- **expo-device** : détection appareil physique, utile pour les tests de notifications.  
- Configurer **app.json** / **app.config.js** : plugins Expo, permissions iOS/Android selon la [doc Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/).

### Dates

```bash
npx expo install dayjs
```

### Identifiants

- **`expo-crypto`** (souvent déjà disponible avec Expo) : génération d’UUID / octets aléatoires sans dépendance fragile sur Hermes.  
  ```bash
  npx expo install expo-crypto
  ```  
- Alternative : `uuid` + **`expo-random`** ou polyfill documenté ; en Expo, **expo-crypto** est en général suffisant pour des IDs transaction.

### Validation

```bash
npm install zod
```

(zod est pur JS, `npm install` suffit.)

### Optionnel V1+

```bash
npx expo install @react-native-community/datetimepicker
```

- **expo-secure-store** : données sensibles (PIN, etc.) plus tard.  
- **@tanstack/react-query** : quand un backend / sync existera.

---

## 4. Navigation — Expo Router

**Moteur : Expo Router** (dossier **`app/`**).

### Principes

- Un fichier **`.tsx`** = une route (ou un layout).  
- **`_layout.tsx`** : piles, onglets, groupes `(tabs)`, `(onboarding)`, etc.  
- **Liens** : `Link` de `expo-router`, ou `router.push()` / `router.replace()`.  
- Activer les **typed routes** quand l’arborescence est stable (`expo-env.d.ts` / config selon doc Expo).

### Structure cible (évolutive)

```
app/
  _layout.tsx                 # Providers : thème, store hydraté, etc.
  index.tsx                   # Redirection onboarding vs app
  (onboarding)/
    _layout.tsx
    welcome.tsx
    mode-choice.tsx
  (app)/
    _layout.tsx
    (tabs)/
      _layout.tsx
      index.tsx               # Dashboard
      transactions.tsx
      stats.tsx
      settings.tsx
    transaction/
      [id].tsx
```

Le code métier réutilisable reste dans **`src/`** (composants, store, domaine) ; **`app/`** reste mince (écrans = composition + navigation).

---

## 5. Store global et stockage local

### Zustand

- État : mode, onboarding, transactions, catégories, objectifs, préférences.  
- **persist** + **AsyncStorage** comme `storage`, clé ex. `uchumi-storage-v1`.  
- Gérer l’**hydratation** (éviter un flash de valeurs vides sur le dashboard).

### Calculs

- Fonctions pures en **`src/domain/`** ou **`src/lib/budget/`** (`.ts`).

---

## 6. Notifications

- **`src/services/notifications.ts`** : permissions, planification / annulation via **expo-notifications**.  
- La décision « alerter ou non » : **domaine** ou **store** ; le service déclenche seulement l’OS.

---

## 7. Arborescence source recommandée

```
app/                     # Routes Expo Router (.tsx)
src/
  components/            # .tsx
  features/              # optionnel
  hooks/                 # .ts
  store/                 # .ts — Zustand
  domain/                # .ts
  services/              # .ts — notifications, export futur
  theme/                 # .ts
  types/                 # .ts
  lib/                   # .ts
```

---

## 8. Thème et UI

- **`src/theme/`** : palette UCHUMI (Tapa, Marshland, Dune, etc.).  
- Composants **`Screen`**, **`Card`**, **`MoneyText`** en **`.tsx`**.  
- **Reanimated** : suivre la config Babel / doc Expo pour votre SDK.

---

## 9. Tests et qualité

- **expo lint** (déjà dans les scripts).  
- Tests unitaires **`.ts`** : Jest peut être ajouté selon le guide Expo / template.

---

## 10. Builds et natif (rappel)

- **Expo Go** : idéal pour le développement tant que vous n’utilisez que des modules supportés par Expo Go.  
- **Development build** (`expo prebuild` + `expo run:ios` / `run:android` ou **EAS Build**) : dès qu’un module exige du code natif non inclus dans Expo Go.  
- Pour la publication store : **EAS Submit** / workflow documenté sur [expo.dev](https://docs.expo.dev).

---

## 11. Résumé

| Sujet | Choix (Expo uniquement) |
|--------|-------------------------|
| Navigation | **Expo Router** (`app/**/*.tsx`) |
| State | **Zustand** |
| Persistance | **AsyncStorage** + persist Zustand |
| Notifications | **expo-notifications** (+ **expo-device**) |
| Validation | **zod** |
| Dates | **dayjs** |
| IDs aléatoires | **expo-crypto** (recommandé) |
| Fichiers React | **`.tsx`** pour écrans et composants |
| Paquets natifs | **`npx expo install`** |

Ce document reflète la décision produit : **continuer uniquement avec Expo**, sans parallèle React Native CLI.
