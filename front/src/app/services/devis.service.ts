import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    const token = localStorage.getItem('authToken');
    const headers = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
    return this.http.get<any>(this.apiUrl, headers);
  }

  getMesDevis(): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
    return this.http.get<any>(`${this.apiUrl}/client`, headers);
  }

  getDevisById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createDevis(devisData: Omit<Devis, 'client' | 'dateDemande'>): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
    return this.http.post<any>(this.apiUrl, devisData, headers);
  }

  updateDevisStatut(id: string, statutData: { statut: string, montantEstime?: number, delaiEstime?: string }): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
    return this.http.put<any>(`${this.apiUrl}/${id}/statut`, statutData, headers);
  }

  deleteDevis(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
