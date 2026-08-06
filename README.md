# Padel Ensemble

Application web pour organiser des parties de padel entre amis : groupes privés
sans compte, calendrier partagé, synchronisation temps réel avec Firestore.

## Stack

* **Frontend** — React 19, TypeScript, Vite
* **UI** — Tailwind CSS v4, composants maison (pas de dépendance shadcn/ui CLI, mais
même esprit : composants copiés dans `src/components/ui`, faciles à modifier)
* **Calendrier** — FullCalendar (vues jour / semaine / mois, drag-to-create)
* **Backend** — Firebase Firestore (temps réel, pas de serveur à gérer)
* **Identité** — aucune authentification ; `localStorage` retient le surnom et le
dernier groupe visité

## Architecture

```
src/
  types/            Types du domaine (Group, Slot, Participant, statut de créneau)
  firebase/
    config.ts       Initialisation Firebase à partir des variables d'env
    groups.ts       Création/recherche de groupe (le code d'invitation EST l'id du doc)
    slots.ts        CRUD + écoute temps réel des créneaux (onSnapshot)
  contexts/
    GroupContext    Groupe actif chargé par code, partagé entre les pages
  hooks/
    useLocalIdentity  Surnom + dernier groupe (localStorage)
    useSlots          Abonnement temps réel aux créneaux d'un groupe
  components/
    ui/             Button, Input, Modal, StatusBadge — briques réutilisables
    calendar/       GroupCalendar (FullCalendar), CreateSlotModal, SlotDetailsModal
    layout/         Navbar, Dashboard
  pages/
    Home, CreateGroup, JoinGroup, GroupPage (calendrier + tableau de bord + recherche)
```

### Modèle de données Firestore

```
groups/{inviteCode}                 doc = { name, inviteCode, createdBy, memberCount, bookingUrl, createdAt }
groups/{inviteCode}/slots/{slotId}  doc = { start, end, createdBy, participants: \[{name, joinedAt}] }
```

Le code d'invitation (`PADEL-XXXXX`) est directement l'identifiant du document
`groups`, donc rejoindre un groupe est une lecture unique en O(1), pas une
requête. C'est aussi le seul « secret » qui protège un groupe : quiconque
possède le lien peut voir et modifier le calendrier — même modèle de confiance
qu'un Google Agenda partagé par lien.

### Pourquoi cette conception

* **Pas de compte** : le brief l'exige explicitement. La contrepartie assumée
est qu'un groupe est protégé par la confidentialité du code, pas par un mot
de passe.
* **Couleurs de créneau dérivées, jamais stockées** : `getSlotStatus()` dans
`types/index.ts` calcule la couleur à partir du nombre de participants à
chaque rendu, il n'y a donc jamais de désynchronisation possible entre le
nombre de joueurs et la couleur affichée.
* **`arrayUnion` / `arrayRemove`** pour les participants plutôt qu'une
sous-collection : un créneau a au plus 4 joueurs, donc un tableau dans le
document est plus simple et se met à jour en une seule écriture atomique.
* 

## Démarrage local

### 1\. Créer un projet Firebase

1. [console.firebase.google.com](https://console.firebase.google.com) → **Ajouter un projet**.
2. Dans **Créer une base de données** (Firestore) → mode **production** →
choisis une région proche de tes utilisateurs.
3. **Paramètres du projet** → **Vos applications** → **Web** (icône `</>`) →
donne un nom → copie l'objet de config affiché.

### 2\. Configurer le projet

```bash
npm install
cp .env.example .env.local
```

Colle les valeurs de ton projet Firebase dans `.env.local`.

### 3\. Déployer les règles de sécurité Firestore

```bash
npm install -g firebase-tools
firebase login
firebase use --add          # sélectionne ton projet Firebase
firebase deploy --only firestore:rules
```

Les règles (`firestore.rules`) autorisent la lecture publique des groupes et
créneaux (nécessaire puisqu'il n'y a pas d'authentification), mais limitent
strictement la forme des écritures : un groupe ne peut avoir son nom modifié,
un créneau ne peut jamais dépasser 4 participants, etc.

### 4\. Lancer en local

```bash
npm run dev
```

## Déploiement

L'app est un site statique (build Vite) + Firestore. Deux options équivalentes :

### Option A — Netlify

1. Pousse le projet sur GitHub.
2. Sur [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**.
3. Build command : `npm run build` — Publish directory : `dist`.
4. Dans **Site settings → Environment variables**, ajoute les 6 variables
`VITE\_FIREBASE\_\*` du fichier `.env.local`.
5. Déploie. Le fichier `public/\_redirects` est déjà en place pour que les
routes `/g/PADEL-XXXXX` fonctionnent après un rafraîchissement de page.

### Option B — Vercel

1. [vercel.com](https://vercel.com) → **Add New → Project** → importe le repo.
2. Framework preset : **Vite** (auto-détecté).
3. Ajoute les mêmes variables d'environnement `VITE\_FIREBASE\_\*`.
4. Déploie. `vercel.json` gère déjà la réécriture SPA.

Une fois déployé, ton URL de partage ressemble à :

```
https://ton-app.netlify.app/join/PADEL-7XQ9M
```

C'est ce lien que le créateur d'un groupe colle dans Messenger — chaque
groupe qui rejoint via ce lien obtient son propre calendrier, totalement
indépendant des autres.

## Évolutions prévues par l'architecture actuelle

Le code est volontairement modulaire pour accueillir, sans réécriture :

* **Plusieurs administrateurs** : ajouter un tableau `admins: string\[]` sur
`Group`, vérifié côté règles Firestore pour les actions sensibles.
* **Statistiques / historique / classement Elo** : les créneaux passés sont
déjà en base ; il s'agit d'agréger `groups/{id}/slots` côté client ou via
une Cloud Function planifiée.
* **Chat de groupe** : nouvelle sous-collection `groups/{id}/messages`, même
pattern `onSnapshot` que `useSlots`.
* **Notifications (push, email, Discord)** : une Cloud Function déclenchée
sur écriture de `slots/{slotId}` quand `participants.length` passe à 4.
* **PWA / apps mobiles** : le frontend React + Vite est prêt pour
`vite-plugin-pwa` ; pour du natif, cette même API Firestore serait
consommée par React Native.

## Limites connues (MVP)

* Un surnom peut être usurpé par n'importe qui dans le groupe (pas de compte).
Acceptable pour un groupe d'amis fermé, à surveiller si le groupe grandit.
* `memberCount` est un compteur best-effort (incrémenté à chaque création de
groupe/créneau), pas un décompte exact de surnoms uniques — suffisant pour
le tableau de bord, à revoir si une précision stricte est nécessaire.

