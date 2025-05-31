import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    return this.http.get<any>(this.apiUrl);
  }

  getContact(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  traiterContact(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/traiter`, {});
  }

  deleteContact(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
