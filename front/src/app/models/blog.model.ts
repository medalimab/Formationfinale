export interface Commentaire {
  _id?: string;
  texte: string;
  utilisateur: any;
  date: Date;
}

export interface Blog {
  _id?: string;
  titre: string;
  contenu: string;
  image?: string;
  auteur: any;
  categories?: string[];
  tags?: string[];
  datePublication: Date;
  commentaires?: Commentaire[];
}
