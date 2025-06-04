import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) { }

  // Méthodes pour utilisateur connecté
  getProfile(): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return this.http.get<any>(`${this.apiUrl}/me`, headers);
  }

  updateProfile(profileData: { nom: string, email: string }): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return this.http.put<any>(`${this.apiUrl}/me`, profileData, headers);
  }

  updatePassword(passwordData: { currentPassword: string, newPassword: string }): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return this.http.put<any>(`${this.apiUrl}/updatepassword`, passwordData, headers);
  }

  // Historique d'activité utilisateur
  getUserActivity(): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    return this.http.get<any>(`${this.apiUrl}/me/activity`, headers);
  }

  // Méthodes pour admin
  getUsers(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getUser(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createUser(userData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, userData);
  }

  updateUser(id: string, userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, userData);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
