import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Temoignage } from '../models/temoignage.model';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class TemoignageService {
  private apiUrl = `${environment.apiUrl}/temoignages`;

  constructor(private http: HttpClient, private storageService: StorageService) { }

  getTemoignages(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getTemoignagesApprouves(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/approuves`);
  }

  getTemoignage(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createTemoignage(temoignageData: Temoignage): Observable<any> {
    return this.http.post<any>(this.apiUrl, temoignageData);
  }

  approuverTemoignage(id: string): Observable<any> {
    const token = this.storageService.getItem('authToken');
    return this.http.put<any>(
      `${this.apiUrl}/${id}/approuver`,
      {},
      token ? { headers: { Authorization: `Bearer ${token}` } } : {}
    );
  }

  updateTemoignage(id: string, temoignageData: Partial<Temoignage>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, temoignageData);
  }

  deleteTemoignage(id: string): Observable<any> {
    const token = this.storageService.getItem('authToken');
    return this.http.delete<any>(
      `${this.apiUrl}/${id}`,
      token ? { headers: { Authorization: `Bearer ${token}` } } : {}
    );
  }
}
