import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RendezVous } from '../models/rendez-vous.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RendezVousService {
  private apiUrl = `${environment.apiUrl}/rendezvous`;

  constructor(private http: HttpClient) { }

  getRendezVous(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getMesRendezVous(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`);
  }

  getRendezVousById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createRendezVous(rendezVousData: Omit<RendezVous, 'client' | 'dateDemande'>): Observable<any> {
    return this.http.post<any>(this.apiUrl, rendezVousData);
  }

  updateRendezVousStatut(id: string, statut: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/statut`, { statut });
  }

  deleteRendezVous(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
