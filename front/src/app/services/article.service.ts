
import { Injectable } from '@angular/core';

/**
 * DEPRECIÉ: Ce service est supprimé. Veuillez utiliser FormationService directement.
 * @deprecated Utilisez FormationService à la place
 */
@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  constructor() {
    console.warn('ArticleService est déprécié. Veuillez utiliser FormationService à la place.');
  }
}