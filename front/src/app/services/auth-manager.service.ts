import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, throwError, of } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';
import { JwtDebugService } from './jwt-debug.service';

@Injectable({
  providedIn: 'root'
})
export class AuthManagerService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private checkTokenInterval: any = null;
  private tokenExpirationTimer: any = null;

  // Statut d'authentification observable
  private authStatus = new BehaviorSubject<boolean>(false);
  public authStatus$ = this.authStatus.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService,
    private jwtDebugService: JwtDebugService
  ) {
    this.initAuthStatus();
  }

  /**
   * Initialise le statut d'authentification et configure
   * la vérification périodique du token
   */
  private initAuthStatus(): void {
    // Vérifier s'il y a un token et s'il est valide
    const tokenStatus = this.jwtDebugService.decodeJwt();
    
    // Mettre à jour le statut d'authentification
    this.authStatus.next(tokenStatus.valid && !tokenStatus.expired);
    
    // Si un token valide existe, configurer son expiration
    if (tokenStatus.valid && !tokenStatus.expired) {
      this.setupTokenRefresh(tokenStatus.data.exp);
    }
    
    // Configurer une vérification périodique (toutes les 5 minutes)
    this.checkTokenInterval = setInterval(() => {
      this.checkTokenValidity();
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Vérifie si le token est valide
   */
  checkTokenValidity(): boolean {
    const tokenStatus = this.jwtDebugService.decodeJwt();
    const isValid = tokenStatus.valid && !tokenStatus.expired;
    
    // Mettre à jour le statut d'authentification
    this.authStatus.next(isValid);
    
    // Si le token est invalide ou expiré, effacer les données d'authentification
    if (!isValid && this.storageService.getItem('authToken')) {
      this.clearAuthData();
    }
    
    return isValid;
  }

  /**
   * Configure un timer pour rafraîchir le token avant son expiration
   */
  private setupTokenRefresh(expTimestamp: number): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    
    const now = Math.floor(Date.now() / 1000);
    const timeToExpiry = expTimestamp - now;
    
    // Si le token expire dans plus de 5 minutes, programmer un rafraîchissement
    // 5 minutes avant l'expiration
    if (timeToExpiry > 5 * 60) {
      const refreshDelay = (timeToExpiry - 5 * 60) * 1000;
      
      this.tokenExpirationTimer = setTimeout(() => {
        this.refreshToken().subscribe();
      }, refreshDelay);
    }
  }  /**
   * Rafraîchit le token si nécessaire
   */
  refreshToken(): Observable<any> {
    // Récupérer le token actuel
    const token = this.storageService.getItem('authToken');
    
    if (!token) {
      console.warn('Pas de token disponible pour le rafraîchissement');
      return of({ success: false, error: 'Token non disponible' });
    }
    
    console.log('Envoi de la requête de rafraîchissement avec token:', token.substring(0, 15) + '...');
    
    // Configurer les en-têtes avec le token actuel
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    // Essayer d'abord une vérification du token
    const tokenStatus = this.jwtDebugService.decodeJwt();
    if (tokenStatus.valid && !tokenStatus.expired) {
      console.log('Token encore valide, pas besoin de rafraîchir');
      return of({ success: true, token: token });
    }
    
    console.log('Token expiré ou invalide, tentative de rafraîchissement');
    
    // Envoyer la requête avec le token dans les en-têtes
    return this.http.post<any>(`${this.apiUrl}/refresh-token`, {}, { headers }).pipe(
      tap(response => {
        if (response && response.success && response.token) {
          console.log('Token rafraîchi avec succès');
          this.storageService.setItem('authToken', response.token);
          
          // Configurer le nouveau timer d'expiration
          const tokenStatus = this.jwtDebugService.decodeJwt();
          if (tokenStatus.valid) {
            this.setupTokenRefresh(tokenStatus.data.exp);
          }
        }
      }),
      catchError(error => {
        console.warn('Échec du rafraîchissement du token:', error);
        // Ne pas déclencher de déconnexion automatique ici car cela peut créer 
        // une boucle infinie avec l'intercepteur
        return of({ success: false, error: 'Échec du rafraîchissement' });
      })
    );
  }

  /**
   * Simule un rafraîchissement de token en se reconnectant
   * avec les informations stockées (solution temporaire)
   */
  simulateTokenRefresh(): Observable<any> {
    const email = this.storageService.getItem('userEmail');
    const password = this.storageService.getItem('userPassword'); // Normalement on ne devrait pas stocker le mot de passe
    
    if (!email || !password) {
      return throwError(() => new Error('Information de connexion manquantes'));
    }
    
    return this.loginUser({ email, password }).pipe(
      tap(() => console.log('Token rafraîchi via re-connexion'))
    );
  }

  /**
   * Connecte l'utilisateur et stocke le token
   */
  loginUser(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.success && response.token) {
          this.storageService.setItem('authToken', response.token);
          this.storageService.setItem('userEmail', credentials.email);
          
          // Optionnel et pas recommandé en production
          // this.storageService.setItem('userPassword', credentials.password);
          
          if (response.role) {
            this.storageService.setItem('userRole', response.role);
          }
          
          // Mettre à jour le statut d'authentification
          this.authStatus.next(true);
          
          // Configurer le timer d'expiration
          const tokenStatus = this.jwtDebugService.decodeJwt();
          if (tokenStatus.valid) {
            this.setupTokenRefresh(tokenStatus.data.exp);
          }
        }
      })
    );
  }

  /**
   * Déconnecte l'utilisateur
   */
  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Efface toutes les données d'authentification
   */
  private clearAuthData(): void {
    this.storageService.removeItem('authToken');
    this.storageService.removeItem('userEmail');
    this.storageService.removeItem('userPassword'); // Si stocké
    this.storageService.removeItem('userRole');
    
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    
    this.authStatus.next(false);
  }

  /**
   * Vérifie si l'utilisateur est admin
   */
  isAdmin(): boolean {
    return this.storageService.getItem('userRole') === 'admin';
  }

  /**
   * Récupère le rôle de l'utilisateur
   */
  getUserRole(): string | null {
    return this.storageService.getItem('userRole');
  }
  
  /**
   * Clean up à la destruction du service
   */
  ngOnDestroy(): void {
    if (this.checkTokenInterval) {
      clearInterval(this.checkTokenInterval);
    }
    
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
  }
}
