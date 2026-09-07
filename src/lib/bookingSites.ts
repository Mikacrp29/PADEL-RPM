export interface BookingSite {
  label: string;
  url: string;
}

/**
 * Liste globale des sites de réservation, valable pour tous les groupes
 * et tous les créneaux. Ajouter une entrée ici suffit à la faire
 * apparaître dans le menu déroulant "Réservation" partout dans l'app.
 */
export const BOOKING_SITES: BookingSite[] = [
  { label: 'Playtomic', url: 'https://playtomic.com/' },
];