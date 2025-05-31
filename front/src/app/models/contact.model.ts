export interface Contact {
  _id?: string;
  nom: string;
  email: string;
  telephone?: string;
  sujet: string;
  message: string;
  dateEnvoi: Date;
  traite: boolean;
}
