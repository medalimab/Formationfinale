import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<any>(`${this.apiUrl}/me`, { headers });
  }

  getRendezVousById(id: string): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers });
  }

  createRendezVous(rendezVousData: any): Observable<any> {
    const token = localStorage.getItem('authToken');
    // Si c'est un FormData (avec fichier/image), on envoie tel quel
    if (rendezVousData instanceof FormData) {
      return this.http.post<any>(this.apiUrl, rendezVousData, {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
      });
    } else {
      // Sinon, on envoie en JSON
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      return this.http.post<any>(this.apiUrl, rendezVousData, { headers });
    }
  }

  updateRendezVousStatut(id: string, statut: string): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    console.log('Header Authorization envoyé:', headers.get('Authorization'));
    return this.http.put<any>(`${this.apiUrl}/${id}/statut`, { statut }, { headers });
  }

  updateRendezVous(id: string, data: any): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.put<any>(`${this.apiUrl}/${id}`, data, { headers });
  }

  deleteRendezVous(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
