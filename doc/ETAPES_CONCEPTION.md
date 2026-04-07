# UCHUMI — Étapes de conception

Document de référence pour enchaîner la conception produit, UX/UI et technique avant et pendant le développement. Il complète `details.md` et `ARCHITECTURE.md`.

---

## Phase 0 — Cadrage (avant code)

1. **Valider la vision**  
   Relire la fiche produit cible (`UCHUMI_Product_Spec.md` lorsqu’elle existe) : modes classique / business, promesse « quotidien + anticipation », public prioritaire.

2. **Prioriser le périmètre V1**  
   Décider ce qui entre en Phase 1 (voir roadmap dans `details.md`) : onboarding, choix de mode, tableau de bord, entrées/sorties, catégories, historique, mise de côté — sans backend.

3. **Définir les flux critiques**  
   Storyboard ou liste : premier lancement → choix mode → fond de départ → première dépense → consultation du « reste » → alerte fond faible (même si l’alerte arrive en Phase 2, anticiper les écrans).

4. **Charte UX**  
   Thème sombre premium, palette (Tapa, Marshland, Dune, etc.), typographie, tailles des montants, états d’erreur et d’alerte.

5. **Modèle de données minimal**  
   Entités : transaction, catégorie, objectif d’épargne, paramètres utilisateur, profil (classique vs business), champs business (ventes, stock) si V1 business partielle ou reportée.

---

## Phase 1 — Design UX/UI détaillé

1. **Arborescence des écrans**  
   Alignée sur la navigation (voir `ARCHITECTURE.md`) : onglets, piles, modales.

2. **Maquettes haute fidélité**  
   Dashboard, formulaires entrée/sortie, liste historique, écran catégories, réglages.

3. **Composants réutilisables**  
   Cartes montants, listes de transactions, sélecteurs de catégorie, boutons primaires/secondaires, graphiques simples (Phase 2 si besoin).

4. **Accessibilité**  
   Contrastes, tailles tactiles, lecteurs d’écran (labels).

5. **Copies et ton**  
   Alignement avec la personnalité de marque : sérieux, rassurant, direct, non infantilisant.

---

## Phase 2 — Spécifications techniques d’implémentation

1. **Valider la stack**  
   **Expo uniquement** (SDK, Expo Router), state, persistance, notifications — liste dans `ARCHITECTURE.md`.

2. **Contrats TypeScript**  
   Types pour transactions, catégories, préférences ; règles de calcul (solde du jour, reste de semaine).

3. **Règles métier documentées**  
   Comment le « reste » est calculé, quand une alerte se déclenche, différence flux perso vs business.

4. **Plan de tests manuels**  
   Scénarios par parcours utilisateur (onboarding → usage quotidien).

---

## Phase 3 — Développement itératif

### Sprint A — Fondations
- Projet **Expo** (Metro via `expo start`), thème, **Expo Router** (`app/`), écrans en **`.tsx`**.
- Store + persistance locale (hydratation au démarrage).
- Routes placeholder pour les flux principaux (groupes, onglets, piles).

### Sprint B — Cœur budget classique
- Onboarding + choix de mode.
- CRUD transactions et catégories (local).
- Tableau de bord avec indicateurs V1 (disponible, dépenses du jour, etc.).
- Historique filtrable simple.

### Sprint C — Épargne et polish
- Mise de côté / objectifs simples.
- Paramètres, devise/format monétaire si applicable.
- Tests sur appareils réels, corrections UX.

### Sprint D — Intelligence et alertes (aligné roadmap Phase 2)
- Statistiques, prévisions simples, budget conseillé, notifications locales.

### Sprint E — Business (roadmap Phase 3)
- Ventes, achats stock, séparation des flux, vues analytiques.

---

## Phase 4 — Qualité et livraison

1. **Performance** : listes longues, rendu du dashboard.  
2. **Sauvegardes / export** : selon roadmap (Phase 4).  
3. **Stores** : préparation fiches App Store / Play Store, captures, confidentialité (données locales).

---

## Synthèse des livrables par phase

| Phase        | Livrable principal                          |
|-------------|----------------------------------------------|
| 0 — Cadrage | Périmètre V1, flux critiques, charte couleur |
| 1 — Design  | Maquettes, composants, copies              |
| 2 — Spec tech | Types, règles métier, plan de tests       |
| 3 — Dev     | Incréments testables par sprint             |
| 4 — Release | Build store, doc utilisateur minimale       |

---

## Règles d’équipe (rappel)

- Tous les composants et écrans React sont en **`.tsx`** (TypeScript + JSX).  
- Fichiers de logique pure sans JSX : **`.ts`**.  
- La structure des dossiers suit `ARCHITECTURE.md`.
