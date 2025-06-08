import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  private getHttpOptions(): { headers: HttpHeaders } {
    const token = localStorage.getItem('authToken');
    return {
      headers: token ? new HttpHeaders({ 'Authorization': `Bearer ${token}` }) : new HttpHeaders()
    };
  }

  // Méthodes pour utilisateur connecté
  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`, this.getHttpOptions());
  }

  updateProfile(profileData: { nom: string, email: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/me`, profileData, this.getHttpOptions());
  }

  updatePassword(passwordData: { currentPassword: string, newPassword: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/updatepassword`, passwordData, this.getHttpOptions());
  }

  // Historique d'activité utilisateur
  getUserActivity(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me/activity`, this.getHttpOptions());
  }

  // Méthodes pour admin
  getUsers(): Observable<any> {
    return this.http.get<any>(this.apiUrl, this.getHttpOptions());
  }

  getUser(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, this.getHttpOptions());
  }

  createUser(userData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, userData, this.getHttpOptions());
  }

  updateUser(id: string, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, userData, this.getHttpOptions());
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, this.getHttpOptions());
  }

  // Méthode admin pour nettoyer les données d'activité corrompues
  cleanActivityData(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/clean-activity`, {}, this.getHttpOptions());
  }
}
