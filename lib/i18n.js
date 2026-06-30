// Dictionnaire des textes fixes de l'interface (nav, boutons, labels communs)
// Les contenus dynamiques (œuvres, textes personnalisables) sont traduits via Supabase _en

export const translations = {
  fr: {
    nav: {
      home: 'Accueil',
      gallery: 'Galerie',
      about: 'À propos',
      admin: 'Admin',
      logout: 'Déconnexion',
    },
    gallery: {
      title: 'La Galerie',
      loading: 'Chargement…',
      artwork: 'œuvre',
      artworks: 'œuvres',
      filters: 'Filtres',
      clearFilters: 'Effacer les filtres',
      all: 'Tout',
      allPrices: 'Tous les prix',
      allAvailability: 'Toutes',
      price: 'Prix',
      availability: 'Disponibilité',
      noResults: 'Aucune œuvre ne correspond à vos filtres.',
      viewArtwork: "Voir l'œuvre",
    },
    pdp: {
      back: '← Retour à la galerie',
      technique: 'Technique',
      dimensions: 'Dimensions',
      duration: 'Temps de réalisation',
      availability: 'Disponibilité',
      contactMe: 'Me contacter',
      sold: 'Œuvre vendue',
      noDescription: 'Pas de description disponible.',
      enlarge: '🔍 Agrandir',
      loading: 'Chargement…',
    },
    contact: {
      title: 'Me contacter',
      firstname: 'Prénom',
      lastname: 'Nom',
      email: 'Email',
      message: 'Message',
      subject: 'Sujet',
      project: 'Votre projet',
      send: 'Envoyer ma demande',
      sending: 'Envoi en cours…',
      sent: 'Message envoyé !',
      sentDesc: 'Merci pour votre demande.',
      sentDesc2: 'Clara vous répondra dans les plus brefs délais.',
      error: 'Une erreur est survenue. Veuillez réessayer.',
      about: 'À propos de :',
      sendAnother: 'Envoyer une autre demande',
    },
    availability: {
      'Disponible': 'Available',
      'Vendu': 'Sold',
    },
    footer: {
      rights: 'Tous droits réservés',
    },
    about: {
      label: 'À propos',
      demarcheTitle1: 'Ma démarche',
      demarcheTitle2: 'artistique',
      contactLabel: 'Commande personnalisée',
      contactTitle: 'Une idée en tête ?',
      contactTitleItalic: 'Parlons-en',
      contactDesc: 'Décrivez votre projet — couleurs, dimensions, émotion souhaitée — et Clara vous répondra pour co-créer votre œuvre unique.',
      ctaTitle: 'Découvrez mes œuvres',
      ctaBtn: 'Voir la galerie',
    },
    custom: 'Création sur mesure',
  },
  en: {
    nav: {
      home: 'Home',
      gallery: 'Gallery',
      about: 'About',
      admin: 'Admin',
      logout: 'Log out',
    },
    gallery: {
      title: 'The Gallery',
      loading: 'Loading…',
      artwork: 'artwork',
      artworks: 'artworks',
      filters: 'Filters',
      clearFilters: 'Clear filters',
      all: 'All',
      allPrices: 'All prices',
      allAvailability: 'All',
      price: 'Price',
      availability: 'Availability',
      noResults: 'No artwork matches your filters.',
      viewArtwork: 'View artwork',
    },
    pdp: {
      back: '← Back to gallery',
      technique: 'Technique',
      dimensions: 'Dimensions',
      duration: 'Time to create',
      availability: 'Availability',
      contactMe: 'Contact me',
      sold: 'Sold',
      noDescription: 'No description available.',
      enlarge: '🔍 Enlarge',
      loading: 'Loading…',
    },
    contact: {
      title: 'Contact me',
      firstname: 'First name',
      lastname: 'Last name',
      email: 'Email',
      message: 'Message',
      subject: 'Subject',
      project: 'Your project',
      send: 'Send my request',
      sending: 'Sending…',
      sent: 'Message sent!',
      sentDesc: 'Thank you for your request.',
      sentDesc2: 'Clara will get back to you shortly.',
      error: 'An error occurred. Please try again.',
      about: 'About:',
      sendAnother: 'Send another request',
    },
    availability: {
      'Disponible': 'Available',
      'Vendu': 'Sold',
    },
    footer: {
      rights: 'All rights reserved',
    },
    about: {
      label: 'About',
      demarcheTitle1: 'My artistic',
      demarcheTitle2: 'approach',
      contactLabel: 'Custom commission',
      contactTitle: 'Have an idea in mind?',
      contactTitleItalic: "Let's talk",
      contactDesc: 'Describe your project — colors, dimensions, desired emotion — and Clara will get back to you to co-create your unique artwork.',
      ctaTitle: 'Discover my artworks',
      ctaBtn: 'View gallery',
    },
    custom: 'Custom creation',
  }
}

export function t(lang, path) {
  const keys = path.split('.')
  let result = translations[lang] || translations.fr
  for (const key of keys) {
    result = result?.[key]
  }
  return result ?? path
}
