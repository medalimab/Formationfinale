import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  createService(serviceData: Service): Observable<any> {
    return this.http.post<any>(this.apiUrl, serviceData);
  }

  updateService(id: string, serviceData: Partial<Service>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, serviceData);
  }

  deleteService(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
