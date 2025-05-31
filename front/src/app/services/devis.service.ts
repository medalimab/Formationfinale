import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Devis } from '../models/devis.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DevisService {
  private apiUrl = `${environment.apiUrl}/devis`;

  constructor(private http: HttpClient) { }

  getDevis(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getMesDevis(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/client`);
  }

  getDevisById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createDevis(devisData: Omit<Devis, 'client' | 'dateDemande'>): Observable<any> {
    return this.http.post<any>(this.apiUrl, devisData);
  }

  updateDevisStatut(id: string, statutData: { statut: string, montantEstime?: number, delaiEstime?: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/statut`, statutData);
  }

  deleteDevis(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
