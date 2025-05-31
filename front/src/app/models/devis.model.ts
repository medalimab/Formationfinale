export interface Devis {
  _id?: string;
  client: any;
  service: string;
  description: string;
  montantEstime?: number;
  delaiEstime?: string;
  statut: 'en_attente' | 'traite' | 'accepte' | 'refuse';
  fichiers?: string[];
  dateDemande: Date;
  dateTraitement?: Date;
}
