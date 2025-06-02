export interface Service {
  _id?: string;
  titre: string;
  description: string;
  categorie: string;
  image?: string;
  prix?: number;
  caracteristiques?: string[];
  disponible?: boolean;
  dateCreation?: Date;
}
