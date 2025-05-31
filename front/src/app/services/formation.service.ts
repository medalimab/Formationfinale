import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Formation } from '../models/formation.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FormationService {
  private apiUrl = `${environment.apiUrl}/formations`;

  constructor(private http: HttpClient) { }

  /**
   * Récupère toutes les formations avec options de pagination et filtrage
   */
  getFormations(page: number = 1, limit: number = 10, category?: string): Observable<{
    success: boolean,
    count: number,
    pagination: any,
    data: Formation[]
  }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (category) {
      params = params.set('categorie', category);
    }

    return this.http.get<{
      success: boolean,
      count: number,
      pagination: any,
      data: Formation[]
    }>(this.apiUrl, { params });
  }

  /**
   * Récupère une formation par son ID
   */
  getFormation(id: string): Observable<{ success: boolean, data: Formation }> {
    return this.http.get<{ success: boolean, data: Formation }>(`${this.apiUrl}/${id}`);
  }
  /**
   * Crée une nouvelle formation
   */
  createFormation(formationData: Formation | FormData): Observable<{ success: boolean, data: Formation }> {
    return this.http.post<{ success: boolean, data: Formation }>(this.apiUrl, formationData);
  }

  /**
   * Met à jour une formation existante
   */
  updateFormation(id: string, formationData: Partial<Formation> | FormData): Observable<{ success: boolean, data: Formation }> {
    return this.http.put<{ success: boolean, data: Formation }>(`${this.apiUrl}/${id}`, formationData);
  }

  /**
   * Supprime une formation
   */
  deleteFormation(id: string): Observable<{ success: boolean, data: {} }> {
    return this.http.delete<{ success: boolean, data: {} }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Recherche des formations par mot-clé
   */
  searchFormations(keyword: string): Observable<{ success: boolean, data: Formation[] }> {
    const params = new HttpParams().set('titre', keyword);
    return this.http.get<{ success: boolean, data: Formation[] }>(
      `${this.apiUrl}`,
      { params }
    );
  }
}