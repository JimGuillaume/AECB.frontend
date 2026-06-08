# AECB - Système de gestion des présences

## Présentation du projet

Cette application est un système web de gestion des présences destiné aux entreprises de construction.

Elle permet :

- Aux chefs d’équipe d’encodage les présences directement depuis un smartphone sur chantier
- Aux administrateurs de gérer les travailleurs, équipes, absences et congés
- Aux managers d’analyser les heures prestées et les heures supplémentaires en temps réel

L’application est conçue pour fonctionner sur :
- Mobile (encodage rapide des présences)
- Desktop (gestion administrative et statistiques)

---

# Technologies utilisées

## Frontend
- Vue.js 3 (Composition API)
- Pinia (gestion d’état)
- Vue Router (navigation)
- Tailwind CSS (design et responsive)
- Handsontable (tableau type Excel pour les présences)
- Chart.js (graphiques et statistiques)
- IcoFont (icônes)

---

# Architecture du projet

Le projet suit une architecture modulaire afin d’assurer la maintenabilité et la scalabilité.

```txt
src/
├── assets/
├── components/
├── composables/
├── router/
├── services/
├── stores/
├── types/
├── utils/
└── views/
```

---

# Explication des dossiers

---

## assets/

Ce dossier contient les fichiers statiques du projet :

- images
- logos
- polices
- styles globaux

Ces fichiers sont utilisés directement dans l’interface utilisateur.

---

## components/

Ce dossier contient les composants Vue réutilisables.

Les composants sont organisés par domaine métier :

- attendance (gestion des présences)
- workers (gestion des travailleurs)
- teams (gestion des équipes)
- charts (graphiques)
- layout (structure de l’application)
- ui (composants génériques)

Cette organisation permet une meilleure lisibilité et réutilisabilité.

---

## router/

Ce dossier contient la configuration des routes de l’application.

Il permet de gérer la navigation entre les pages :

- page de connexion
- tableau de bord
- gestion des présences
- gestion des travailleurs
- gestion des équipes

Il gère également la protection des routes selon les rôles utilisateur.

---

## services/

Ce dossier centralise tous les appels vers l’API backend.

Au lieu de faire des requêtes directement dans les composants, elles sont regroupées ici.

Il permet de gérer :
- les présences
- les travailleurs
- les équipes
- l’authentification

Cela améliore la structure et la maintenabilité du projet.

---

## stores/

Ce dossier contient la gestion de l’état global via Pinia.

Il permet de partager des données entre plusieurs composants sans passer de props.

Exemples de données stockées :
- utilisateur connecté
- équipe sélectionnée
- mois sélectionné
- présences

---

## types/

Ce dossier contient les types TypeScript.

Ils définissent la structure des données :
- travailleurs
- équipes
- présences
- réponses API

Cela permet de sécuriser le code et d’éviter les erreurs.

---

## utils/

Ce dossier contient des fonctions utilitaires indépendantes de Vue.

Exemples :
- formatage des dates
- calcul des jours ouvrables
- constantes (codes de présence)
- fonctions d’aide générales

---

## views/

Ce dossier contient les pages principales de l’application.

Chaque fichier représente une page complète liée à une route.

Exemples :
- tableau de bord
- gestion des présences
- gestion des travailleurs
- gestion des équipes

Les views utilisent plusieurs composants pour construire l’interface.

---

# Fonctionnalités principales

- Gestion des présences des travailleurs
- Gestion des équipes et sous-équipes
- Gestion des travailleurs
- Gestion des congés et absences
- Calcul des heures supplémentaires
- Statistiques et graphiques
- Gestion des rôles (admin, manager, chef, travailleur)
- Interface responsive (mobile et desktop)

---

# Installation du projet

## 1. Installer les dépendances

```bash
npm install
```

---

## 2. Installer les librairies nécessaires

```bash
npm install pinia
npm install vue-router
npm install tailwindcss
npm install handsontable @handsontable/vue3
npm install chart.js vue-chartjs
npm install icofont
```

---

## 3. Lancer le projet

```bash
npm run dev
```

---