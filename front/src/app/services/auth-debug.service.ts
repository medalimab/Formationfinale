import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthDebugService {
  constructor(private storageService: StorageService) {}

  /**
   * Vérifie l'état de l'authentification et retourne des informations de débogage
   */
  checkAuthState(): { isAuthenticated: boolean; token: string | null; tokenExpired: boolean; tokenData: any } {
    const token = this.storageService.getItem('authToken');
    let tokenData = null;
    let tokenExpired = true;
    
    if (token) {
      try {
        // Décoder le JWT (sans vérification de signature)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        tokenData = JSON.parse(jsonPayload);
        const expiryDate = new Date(tokenData.exp * 1000);
        tokenExpired = expiryDate < new Date();
      } catch (error) {
        console.error('Erreur lors du décodage du token', error);
      }
    }

    return {
      isAuthenticated: !!token && !tokenExpired,
      token,
      tokenExpired,
      tokenData
    };
  }

  /**
   * Affiche dans la console l'état actuel de l'authentification
   */
  debugAuth(): void {
    const authState = this.checkAuthState();
    console.group("État de l'authentification");
    console.log("Authentifié:", authState.isAuthenticated);
    console.log("Token:", authState.token ? "Présent" : "Absent");
    if (authState.token) {
      console.log("Token expiré:", authState.tokenExpired);
      console.log("Données du token:", authState.tokenData);
    }
    console.log("API URL:", environment.apiUrl);
    console.groupEnd();
  }

  /**
   * Teste une requête authentifiée vers le backend pour vérifier si le token est accepté
   * @param http Le service HttpClient à utiliser
   * @param endpoint L'endpoint API à tester (sans la base URL)
   * @returns Une promesse qui résout avec le résultat du test
   */
  testAuthEndpoint(http: any, endpoint: string = 'users/me'): Promise<any> {
    const token = this.storageService.getItem('authToken');
    const apiUrl = `${environment.apiUrl}/${endpoint}`;
    
    return new Promise((resolve) => {
      if (!token) {
        resolve({
          success: false,
          error: 'Pas de token disponible',
          status: 'NO_TOKEN'
        });
        return;
      }
      
      const headers = {
        'Authorization': `Bearer ${token}`
      };
      
      const startTime = Date.now();
      
      // Tester l'endpoint avec le token actuel
      http.get(apiUrl, { headers }).subscribe({
        next: (response: any) => {
          resolve({
            success: true,
            data: response,
            responseTime: Date.now() - startTime,
            status: 'OK'
          });
        },        error: (error: any) => {
          resolve({
            success: false,
            error: error?.message || 'Erreur inconnue',
            status: error?.status,
            statusText: error?.statusText,
            responseTime: Date.now() - startTime
          });
        }
      });
    });
  }
}
