import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthFixService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private authTokenSubject = new BehaviorSubject<string | null>(null);
  public authToken$ = this.authTokenSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService
  ) {
    // Initialiser le token depuis le stockage
    const token = this.storageService.getItem('authToken');
    if (token) {
      this.authTokenSubject.next(token);
    }
  }

  /**
   * Vérifie si le token est présent
   */
  hasToken(): boolean {
    return !!this.storageService.getItem('authToken');
  }

  /**
   * Obtient le token actuel
   */
  getToken(): string | null {
    const token = this.storageService.getItem('authToken');
    console.log(`AuthFixService: Token récupéré du stockage: ${token ? token.substring(0, 10) + '...' : 'null'}`);
    return token;
  }

  /**
   * Rafraîchit le token
   */
  refreshToken(): Observable<any> {
    console.log('AuthFixService: Tentative de rafraîchissement du token');
    
    const token = this.getToken();
    if (!token) {
      console.warn('AuthFixService: Pas de token à rafraîchir');
      return of({ success: false, message: 'Pas de token disponible' });
    }

    // Ajouter le token dans les headers
    const headers = { 'Authorization': `Bearer ${token}` };
    
    return this.http.post<any>(`${this.apiUrl}/refresh-token`, {}, { headers }).pipe(
      tap(response => {
        if (response && response.success && response.token) {
          console.log('AuthFixService: Token rafraîchi avec succès');
          this.setToken(response.token);
          
          // Si un rôle est retourné, le stocker également
          if (response.role) {
            this.storageService.setItem('userRole', response.role);
          }
        } else {
          console.warn('AuthFixService: Réponse de rafraîchissement invalide');
        }
      }),
      catchError(error => {
        console.error('AuthFixService: Erreur lors du rafraîchissement du token', error);
        return of({ success: false, message: 'Erreur lors du rafraîchissement du token' });
      })
    );
  }

  /**
   * Enregistre le token et notifie les observateurs
   */
  setToken(token: string): void {
    console.log(`AuthFixService: Stockage du nouveau token: ${token.substring(0, 10)}...`);
    this.storageService.setItem('authToken', token);
    this.authTokenSubject.next(token);
  }

  /**
   * Supprime le token et notifie les observateurs
   */  clearToken(): void {
    console.log('AuthFixService: Suppression du token');
    this.storageService.removeItem('authToken');
    this.storageService.removeItem('userRole');
    this.storageService.removeItem('userEmail');
    this.storageService.removeItem('userId');
    this.authTokenSubject.next(null);
  }
  
  /**
   * Récupère le rôle stocké de l'utilisateur
   */
  getStoredRole(): string | null {
    return this.storageService.getItem('userRole');
  }

  /**
   * Connecte l'utilisateur
   */
  login(credentials: { email: string; password: string }): Observable<any> {
    console.log(`AuthFixService: Tentative de connexion pour ${credentials.email}`);
    
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.success && response.token) {
          console.log('AuthFixService: Connexion réussie, token obtenu');
          this.setToken(response.token);
          // Stocker également l'email, le rôle et l'ID utilisateur
          this.storageService.setItem('userEmail', credentials.email);
          if (response.role) {
            this.storageService.setItem('userRole', response.role);
          }
          if (response.userId || response.user_id || response.user?._id) {
            // Selon la structure de la réponse backend
            this.storageService.setItem('userId', response.userId || response.user_id || response.user._id);
          }
        } else {
          console.warn('AuthFixService: Réponse de connexion invalide');
        }
      }),
      catchError(error => {
        console.error('AuthFixService: Erreur de connexion', error);
        throw error;
      })
    );
  }

  /**
   * Déconnecte l'utilisateur
   */
  logout(): void {
    console.log('AuthFixService: Déconnexion de l\'utilisateur');
    this.clearToken();
    this.router.navigate(['/auth/login']);
  }
  /**
   * Récupère le token et garantit qu'il est valide
   */
  ensureValidToken(): Observable<string | null> {
    console.log('AuthFixService: Vérification de la validité du token');
    
    const token = this.getToken();
    if (!token) {
      console.warn('AuthFixService: Pas de token disponible');
      return of(null);
    }

    // Vérifie si le token est expiré (simple vérification basique)
    try {
      const payload = this.parseJwtPayload(token);
      const now = Math.floor(Date.now() / 1000); // Temps actuel en secondes
      
      if (payload && payload.exp && now < payload.exp) {
        console.log('AuthFixService: Token encore valide, expire dans', payload.exp - now, 'secondes');
        return of(token);
      }
      
      console.warn('AuthFixService: Token expiré, tentative de rafraîchissement');
      
      // Si le token est expiré, essayer de le rafraîchir
      return this.refreshToken().pipe(
        tap(response => {
          console.log('AuthFixService: Réponse du rafraîchissement:', response);
        }),
        catchError(error => {
          console.error('AuthFixService: Erreur lors du rafraîchissement du token', error);
          this.clearToken(); // Nettoyer le token invalide
          return of(null);
        }),
        // Mapper la réponse pour extraire uniquement le token
        tap(response => {
          if (response && response.success && response.token) {
            console.log('AuthFixService: Nouveau token obtenu par rafraîchissement');
          } else {
            console.warn('AuthFixService: Échec du rafraîchissement du token');
            this.clearToken(); // Nettoyer le token si le rafraîchissement a échoué
          }
        }),
        // Retourner le nouveau token ou null
        map(response => response && response.success && response.token ? response.token : null)
      );
    } catch (error) {
      console.error('AuthFixService: Erreur lors de l\'analyse du token', error);
      this.clearToken(); // Nettoyer le token invalide
      return of(null);
    }
  }

  /**
   * Parse le payload d'un token JWT
   */
  private parseJwtPayload(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('AuthFixService: Erreur lors du parsage du payload JWT', e);
      return null;
    }
  }
}
