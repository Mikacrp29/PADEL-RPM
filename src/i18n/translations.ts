export type Language = 'fr' | 'en';

export const translations = {
  fr: {
    // Home
    'home.badge': 'Sans compte, sans mot de passe',
    'home.title': 'Padel Ensemble',
    'home.subtitle':
      'Un calendrier partagé pour organiser vos parties entre amis. Créez un groupe, partagez le lien, jouez.',
    'home.createGroup': 'Créer un groupe',
    'home.joinGroup': 'Rejoindre un groupe',
    'home.noFavorites': '⭐ Aucun groupe favori',
    'home.myGroups': '⭐ Mes groupes',
    'home.removeFavorite': 'Retirer des favoris',
    'home.previewTitle': 'À quoi ça ressemble',
    'home.previewSubtitle': 'Chaque créneau change de couleur selon le nombre de joueurs.',
    'home.recentGroups': 'Récemment consultés',
    'home.viewTutorial': '📸 Voir le tuto en images',
    'home.followUs': 'Suis-nous pour les nouveautés et tutos vidéo',

    // CreateGroup
    'createGroup.back': 'Retour',
    'createGroup.title': 'Créer un groupe',
    'createGroup.subtitle':
      'Un calendrier privé, uniquement visible par les personnes que tu invites.',
    'createGroup.groupName': 'Nom du groupe',
    'createGroup.groupNamePlaceholder': 'Ex. Les Rois du Padel',
    'createGroup.yourName': 'Ton nom (optionnel)',
    'createGroup.yourNamePlaceholder': 'Ex. Julien',
    'createGroup.errorNoName': 'Donne un nom à ton groupe.',
    'createGroup.errorFailed': 'Impossible de créer le groupe. Réessaie.',
    'createGroup.creating': 'Création…',
    'createGroup.submit': 'Créer le groupe',
    'createGroup.created': 'Groupe créé 🎉',
    'createGroup.inviteCode': "Code d'invitation",
    'createGroup.inviteLink': 'Lien à partager',
    'createGroup.openCalendar': 'Ouvrir le calendrier',

    // JoinGroup
    'joinGroup.title': 'Rejoindre un groupe',
    'joinGroup.subtitle': 'Colle le code reçu par un ami, par ex.',
    'joinGroup.errorNotFound': "Ce code d'invitation est introuvable.",
    'joinGroup.errorNetwork': 'Impossible de contacter le serveur. Vérifie ta connexion.',
    'joinGroup.searching': 'Recherche…',
    'joinGroup.submit': 'Rejoindre',

    // Navbar
    'navbar.invite': 'Inviter',
    'navbar.addFavorite': 'Ajouter aux favoris',
    'navbar.removeFavorite': 'Retirer des favoris',
    'navbar.anonymous': 'Anonyme',

    // Dashboard
    'dashboard.slotsThisWeek': 'Créneaux cette semaine',
    'dashboard.validatedMatches': 'Matchs validés',
    'dashboard.nextMatch': 'Prochain match',
    'dashboard.groupPlayers': 'Joueurs du groupe',

    // Filters
    'filter.all': 'Tous',
    'filter.upcoming': 'À venir',
    'filter.ready': 'Matchs validés',
    'filter.mine': 'Mes disponibilités',
    'filter.clear': 'effacer',

    // GroupPage
    'groupPage.loading': 'Chargement du groupe…',
    'groupPage.notFound': "Ce groupe n'existe pas.",
    'groupPage.tryAnotherCode': 'Essayer un autre code',

    // Calendar
    'calendar.month': 'Mois',
    'calendar.week': 'Semaine',
    'calendar.day': 'Jour',
    'calendar.today': "aujourd'hui",

    // CreateSlotModal
    'createSlot.title': 'Nouveau créneau',
    'createSlot.nickname': 'Nom ou surnom',
    'createSlot.nicknamePlaceholder': 'Ex. Julien',
    'createSlot.startTime': 'Heure de début',
    'createSlot.endTime': 'Heure de fin',
    'createSlot.club': 'Club proposé',
    'createSlot.optional': '(optionnel)',
    'createSlot.clubPlaceholder': 'Ex. Padel Club Anderlecht',
    'createSlot.errorNoNickname': 'Indique ton nom ou surnom.',
    'createSlot.errorTimeOrder': "L'heure de fin doit être après l'heure de début.",
    'createSlot.errorFailed': 'Impossible de créer le créneau. Réessaie.',
    'createSlot.creating': 'Création…',
    'createSlot.submit': 'Créer le créneau',

    // SlotDetailsModal
    'slotDetails.title': 'Détails du créneau',
    'slotDetails.deleteEmptyConfirm': 'Supprimer ce créneau vide ?',
    'slotDetails.cancel': 'Annuler',
    'slotDetails.confirm': 'Confirmer',
    'slotDetails.deleting': 'Suppression…',
    'slotDetails.deleteSlot': 'Supprimer ce créneau',
    'slotDetails.playersRegistered': 'Joueurs inscrits',
    'slotDetails.noOneYet': "Personne pour l'instant.",
    'slotDetails.bookCourt': '🎾 Réserver le terrain',
    'slotDetails.nicknamePlaceholder': 'Ton nom ou surnom',
    'slotDetails.clubPlaceholder': 'Club proposé (optionnel)',
    'slotDetails.errorDuplicate': 'Ce surnom est déjà inscrit sur ce créneau.',
    'slotDetails.errorGeneric': 'Une erreur est survenue. Réessaie.',
    'slotDetails.errorDeleteFailed': 'Impossible de supprimer ce créneau. Réessaie.',
    'slotDetails.wait': 'Un instant…',
    'slotDetails.leave': '❌ Je ne suis plus disponible',
    'slotDetails.join': '➕ Je participe',

    // Slot status
    'status.empty': 'Aucun joueur',
    'status.low': 'En attente de joueurs',
    'status.mid': 'Encore 1 joueur',
    'status.ready': '🎾 Match possible',

    // Modal
    'modal.close': 'Fermer',

    // Auth
    'auth.signIn': 'Se connecter',
    'auth.signUp': "S'inscrire",
    'auth.signOut': 'Se déconnecter',
    'auth.myAccount': 'Mon compte',
    'auth.continueWithGoogle': 'Continuer avec Google',
    'auth.or': 'ou',
    'auth.email': 'Adresse e-mail',
    'auth.password': 'Mot de passe',
    'auth.nickname': 'Ton nom ou surnom',
    'auth.noAccount': 'Pas encore de compte ?',
    'auth.haveAccount': 'Déjà un compte ?',
    'auth.forgotPassword': 'Mot de passe oublié ?',
    'auth.resetSent': 'E-mail de réinitialisation envoyé.',
    'auth.errorGeneric': 'Identifiants incorrects ou compte déjà existant.',
    'auth.titleSignIn': 'Se connecter',
    'auth.titleSignUp': 'Créer un compte',
    'auth.submitSignIn': 'Se connecter',
    'auth.submitSignUp': 'Créer mon compte',
    'auth.submitting': 'Un instant…',
    'auth.accountBenefits':
      'Un compte gratuit relie tes favoris à tous tes appareils et débloque les notifications quand un créneau se remplit.',
    'auth.continueWithoutAccount': 'Continuer sans compte',
    'auth.notifyByEmail': 'Me notifier par e-mail quand un créneau se remplit',

    // Common
    'common.done': 'Terminé',

    // Invite
    'invite.title': 'Inviter des amis',
    'invite.subtitle': "Partage ce code ou ce lien pour que d'autres rejoignent le groupe.",

    // Tutorial
    'tutorial.title': 'Comment ça marche',

    // Misc
    'lang.switchTo': 'EN',
    dateLocale: 'fr-FR',
    fcLocale: 'fr',
  },
  en: {
    // Home
    'home.badge': 'No account, no password',
    'home.title': 'Padel Together',
    'home.subtitle':
      'A shared calendar to organize matches with friends. Create a group, share the link, play.',
    'home.createGroup': 'Create a group',
    'home.joinGroup': 'Join a group',
    'home.noFavorites': '⭐ No favorite groups',
    'home.myGroups': '⭐ My groups',
    'home.removeFavorite': 'Remove from favorites',
    'home.previewTitle': 'What it looks like',
    'home.previewSubtitle': 'Each slot changes color based on how many players joined.',
    'home.recentGroups': 'Recently viewed',
    'home.viewTutorial': '📸 View the picture tutorial',
    'home.followUs': 'Follow us for news and video tutorials',

    // CreateGroup
    'createGroup.back': 'Back',
    'createGroup.title': 'Create a group',
    'createGroup.subtitle': 'A private calendar, only visible to the people you invite.',
    'createGroup.groupName': 'Group name',
    'createGroup.groupNamePlaceholder': 'E.g. The Padel Kings',
    'createGroup.yourName': 'Your name (optional)',
    'createGroup.yourNamePlaceholder': 'E.g. Julien',
    'createGroup.errorNoName': 'Give your group a name.',
    'createGroup.errorFailed': 'Could not create the group. Try again.',
    'createGroup.creating': 'Creating…',
    'createGroup.submit': 'Create group',
    'createGroup.created': 'Group created 🎉',
    'createGroup.inviteCode': 'Invite code',
    'createGroup.inviteLink': 'Link to share',
    'createGroup.openCalendar': 'Open calendar',

    // JoinGroup
    'joinGroup.title': 'Join a group',
    'joinGroup.subtitle': 'Paste the code you received from a friend, e.g.',
    'joinGroup.errorNotFound': 'This invite code could not be found.',
    'joinGroup.errorNetwork': 'Could not reach the server. Check your connection.',
    'joinGroup.searching': 'Searching…',
    'joinGroup.submit': 'Join',

    // Navbar
    'navbar.invite': 'Invite',
    'navbar.addFavorite': 'Add to favorites',
    'navbar.removeFavorite': 'Remove from favorites',
    'navbar.anonymous': 'Anonymous',

    // Dashboard
    'dashboard.slotsThisWeek': 'Slots this week',
    'dashboard.validatedMatches': 'Validated matches',
    'dashboard.nextMatch': 'Next match',
    'dashboard.groupPlayers': 'Group players',

    // Filters
    'filter.all': 'All',
    'filter.upcoming': 'Upcoming',
    'filter.ready': 'Validated matches',
    'filter.mine': 'My availabilities',
    'filter.clear': 'clear',

    // GroupPage
    'groupPage.loading': 'Loading group…',
    'groupPage.notFound': "This group doesn't exist.",
    'groupPage.tryAnotherCode': 'Try another code',

    // Calendar
    'calendar.month': 'Month',
    'calendar.week': 'Week',
    'calendar.day': 'Day',
    'calendar.today': 'today',

    // CreateSlotModal
    'createSlot.title': 'New slot',
    'createSlot.nickname': 'Name or nickname',
    'createSlot.nicknamePlaceholder': 'E.g. Julien',
    'createSlot.startTime': 'Start time',
    'createSlot.endTime': 'End time',
    'createSlot.club': 'Suggested club',
    'createSlot.optional': '(optional)',
    'createSlot.clubPlaceholder': 'E.g. Anderlecht Padel Club',
    'createSlot.errorNoNickname': 'Enter your name or nickname.',
    'createSlot.errorTimeOrder': 'End time must be after start time.',
    'createSlot.errorFailed': 'Could not create the slot. Try again.',
    'createSlot.creating': 'Creating…',
    'createSlot.submit': 'Create slot',

    // SlotDetailsModal
    'slotDetails.title': 'Slot details',
    'slotDetails.deleteEmptyConfirm': 'Delete this empty slot?',
    'slotDetails.cancel': 'Cancel',
    'slotDetails.confirm': 'Confirm',
    'slotDetails.deleting': 'Deleting…',
    'slotDetails.deleteSlot': 'Delete this slot',
    'slotDetails.playersRegistered': 'Players registered',
    'slotDetails.noOneYet': 'No one yet.',
    'slotDetails.bookCourt': '🎾 Book the court',
    'slotDetails.nicknamePlaceholder': 'Your name or nickname',
    'slotDetails.clubPlaceholder': 'Suggested club (optional)',
    'slotDetails.errorDuplicate': 'This nickname is already registered on this slot.',
    'slotDetails.errorGeneric': 'Something went wrong. Try again.',
    'slotDetails.errorDeleteFailed': 'Could not delete this slot. Try again.',
    'slotDetails.wait': 'One moment…',
    'slotDetails.leave': "❌ I'm no longer available",
    'slotDetails.join': "➕ I'm in",

    // Slot status
    'status.empty': 'No players',
    'status.low': 'Waiting for players',
    'status.mid': '1 more player needed',
    'status.ready': '🎾 Match ready',

    // Modal
    'modal.close': 'Close',

    // Auth
    'auth.signIn': 'Sign in',
    'auth.signUp': 'Sign up',
    'auth.signOut': 'Sign out',
    'auth.myAccount': 'My account',
    'auth.continueWithGoogle': 'Continue with Google',
    'auth.or': 'or',
    'auth.email': 'Email address',
    'auth.password': 'Password',
    'auth.nickname': 'Your name or nickname',
    'auth.noAccount': "Don't have an account?",
    'auth.haveAccount': 'Already have an account?',
    'auth.forgotPassword': 'Forgot your password?',
    'auth.resetSent': 'Password reset email sent.',
    'auth.errorGeneric': 'Incorrect credentials or account already exists.',
    'auth.titleSignIn': 'Sign in',
    'auth.titleSignUp': 'Create an account',
    'auth.submitSignIn': 'Sign in',
    'auth.submitSignUp': 'Create my account',
    'auth.submitting': 'One moment…',
    'auth.accountBenefits':
      'A free account syncs your favorites across devices and unlocks notifications when a slot fills up.',
    'auth.continueWithoutAccount': 'Continue without an account',
    'auth.notifyByEmail': 'Email me when a slot fills up',

    // Common
    'common.done': 'Done',

    // Invite
    'invite.title': 'Invite friends',
    'invite.subtitle': 'Share this code or link so others can join the group.',

    // Tutorial
    'tutorial.title': 'How it works',

    // Misc
    'lang.switchTo': 'FR',
    dateLocale: 'en-GB',
    fcLocale: 'en',
  },
} as const;

export type TranslationKey = keyof (typeof translations)['fr'];
