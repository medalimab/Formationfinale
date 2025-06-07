import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service } from '../models/service.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServiceApiService {  private apiUrl = `${environment.apiUrl}/services`;

  constructor(private http: HttpClient) { }

  getServices(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getService(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getServicesByCategorie(categorie: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/categorie/${categorie}`);
  }
  createService(serviceData: FormData | Service): Observable<any> {
    const token = localStorage.getItem('authToken');
    if (serviceData instanceof FormData) {
      // Envoi d'un FormData (avec image)
      return this.http.post<any>(this.apiUrl, serviceData, {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
      });
    } else {
      // Envoi d'un JSON (sans image)
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      return this.http.post<any>(this.apiUrl, serviceData, { headers });
    }
  }

  updateService(id: string, serviceData: FormData | Partial<Service>): Observable<any> {
    const token = localStorage.getItem('authToken');
    let headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    // Si c'est du JSON, ajouter le content-type
    if (!(serviceData instanceof FormData)) {
      headers = headers.set('Content-Type', 'application/json');
    }
    return this.http.put<any>(`${this.apiUrl}/${id}`, serviceData, { headers });
  }
  deleteService(id: string): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
  }

  getUserServices(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mes-services`);
  }
}
