export interface RendezVous {
  _id?: string;
  client: any;
  service: string;
  date: Date;
  heure: string;
  duree: number; // en minutes
  notes?: string;
  statut: 'en_attente' | 'confirme' | 'annule' | 'complete';
  dateDemande: Date;
}
