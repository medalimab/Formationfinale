import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthDiagnosticService {
  private apiUrl = `${environment.apiUrl}/debug`;

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) { }

  /**
   * Vérifie l'état du token actuel
   */
  checkTokenStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/token`);
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  checkAuth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth`);
  }

  /**
   * Diagnostique les problèmes d'authentification
   */
  async diagnoseAuthIssues(): Promise<any> {
    console.log('======= DIAGNOSTIC D\'AUTHENTIFICATION =======');
    
    // Vérifier le stockage local
    const token = this.storageService.getItem('authToken');
    const userRole = this.storageService.getItem('userRole');
    const userEmail = this.storageService.getItem('userEmail');
    
    console.log('Token stocké:', token ? `${token.substring(0, 10)}...` : 'Aucun');
    console.log('Rôle utilisateur stocké:', userRole || 'Aucun');
    console.log('Email utilisateur stocké:', userEmail || 'Aucun');
    
    // Examiner le token
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          try {
            const payload = JSON.parse(atob(parts[1]));
            console.log('Payload du token:', payload);
            
            const expDate = new Date(payload.exp * 1000);
            const now = new Date();
            const isExpired = now > expDate;
            
            console.log('Date d\'expiration:', expDate.toLocaleString());
            console.log('Token expiré:', isExpired ? 'OUI' : 'NON');
            if (!isExpired) {
              console.log('Temps restant:', Math.floor((expDate.getTime() - now.getTime()) / 1000 / 60), 'minutes');
            } else {
              console.log('Expiré depuis:', Math.floor((now.getTime() - expDate.getTime()) / 1000 / 60), 'minutes');
            }
          } catch (e) {
            console.error('Erreur lors de l\'analyse du payload:', e);
          }
        } else {
          console.error('Format de token invalide (doit avoir 3 parties)');
        }
      } catch (e) {
        console.error('Erreur lors de l\'analyse du token:', e);
      }
    }
    
    console.log('========================================');
    
    // Retourner ces informations pour l'interface utilisateur
    return {
      hasToken: !!token,
      userRole,
      userEmail
    };
  }
}
