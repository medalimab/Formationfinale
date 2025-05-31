import { Formation } from './formation.model';

export interface PanierItem {
  formation: Formation;
  quantity: number;
}

export interface PanierFormationItem {
  formation: Formation;
  dateAjout?: Date;
}

export interface Panier {
  _id?: string;
  user: string;
  formations: PanierFormationItem[];
  total: number;
  dateCreation?: Date;
}
