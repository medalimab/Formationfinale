import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contact } from '../models/contact.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactService {  private apiUrl = `${environment.apiUrl}/contact`;

  constructor(private http: HttpClient) { }

  envoyerContact(contactData: Contact): Observable<any> {
    return this.http.post<any>(this.apiUrl, contactData);
  }

  // Méthodes pour admin
  getContacts(): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.get<any>(this.apiUrl, { headers });
  }

  getContact(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  traiterContact(id: string): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.put<any>(`${this.apiUrl}/${id}/traiter`, {}, { headers });
  }

  deleteContact(id: string): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers });
  }
}
