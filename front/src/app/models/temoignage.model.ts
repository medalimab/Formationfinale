export interface Temoignage {
  _id?: string;
  nom: string;
  poste?: string;
  entreprise?: string;
  commentaire: string;
  note: number;
  image?: string;
  dateCreation: Date;
  approuve: boolean;
}
