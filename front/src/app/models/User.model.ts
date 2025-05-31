
export interface User {
  _id?: string;
  nom: string;
  email: string;
  password?: string;
  role?: 'user' | 'formateur' | 'admin';
  formationsCrees?: string[];
}