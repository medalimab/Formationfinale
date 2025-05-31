export interface Formation {
  _id?: string;
  titre: string;
  description: string;
  prix: number;
  duree: string;
  categorie: string;
  formateur?: any;
  image?: string;
  dateCreation?: Date;
}
