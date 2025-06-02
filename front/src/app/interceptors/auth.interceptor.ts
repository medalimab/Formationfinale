import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, filter, take, switchMap, finalize } from 'rxjs/operators';
import { StorageService } from '../services/storage.service';
import { Router } from '@angular/router';
import { JwtDebugService } from '../services/jwt-debug.service';
import { AuthManagerService } from '../services/auth-manager.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  
  constructor(
    private storageService: StorageService,
    private router: Router,
    private jwtDebugService: JwtDebugService,
    private authManager: AuthManagerService
  ) {}intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Déboguer les requêtes
    console.log(`Requête interceptée: ${request.method} ${request.url}`);

    // Éviter d'intercepter les requêtes de rafraîchissement pour éviter les boucles infinies
    if (request.url.includes('/auth/refresh-token')) {
      // Mais si c'est une requête de rafraîchissement, s'assurer que le token est ajouté
      const token = this.storageService.getItem('authToken');
      if (token) {
        console.log(`Token ajouté à la requête de rafraîchissement: ${token.substring(0, 10)}...`);
        request = this.addToken(request, token);
      } else {
        console.warn('Pas de token disponible pour la requête de rafraîchissement');
      }
      return next.handle(request);
    }
    
    // Ne pas ajouter le token pour les routes d'authentification et les routes publiques
    if (request.url.includes('/auth/login') || request.url.includes('/auth/register') || 
        request.url.includes('/contact')) {
      console.log('Route d\'authentification ou publique, pas de token requis');
      // Aucun token nécessaire pour ces routes
      return next.handle(request);
    }

    // Pour les routes GET publiques
    if (request.method === 'GET' && (
      (request.url.includes('/formations') && !request.url.includes('/mes-formations')) || 
      (request.url.includes('/blogs') && !request.url.includes('/mes-blogs')) || 
      (request.url.includes('/services') && !request.url.includes('/mes-services'))
    )) {
      console.log('Route GET publique, pas de token requis');
      // Si c'est GET sur une ressource publique et pas une ressource utilisateur spécifique
      return next.handle(request);
    }
    
    console.log('Route nécessitant un token d\'authentification');
    
    // Récupérer le token depuis le storage
    const token = this.storageService.getItem('authToken');
    
    // Si pas de token, laisser passer la requête sans modification
    if (!token) {
      console.error('ERREUR: Token manquant pour une route protégée:', request.url);
      return next.handle(request);
    }
    
    // Vérifier si le token est toujours valide avant de l'utiliser
    const tokenStatus = this.jwtDebugService.decodeJwt();
    
    console.log('État du token:', JSON.stringify({
      valid: tokenStatus.valid,
      expired: tokenStatus.expired,
      payloadExtrait: tokenStatus.data ? 
        { id: tokenStatus.data.id, role: tokenStatus.data.role } : 'Non disponible'
    }));
    
    // Si le token est expiré, on essaie de le rafraîchir
    if (tokenStatus.valid && tokenStatus.expired) {
      return this.handle401Error(request, next);
    }
    
    // Si le token est valide, l'ajouter à la requête
    if (tokenStatus.valid) {
      request = this.addToken(request, token);
      console.log('Token ajouté à la requête:', token.substring(0, 20) + '...'); // Log limité pour la sécurité
      
      return next.handle(request).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            // Token non valide ou expiré
            console.warn(`Erreur 401 pour ${request.url}: ${error.message}`);
            return this.handle401Error(request, next);
          }
          return throwError(() => error);
        })
      );
    }
    
    return next.handle(request);
  }
  
  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Tentative de gestion d\'erreur 401 pour URL:', request.url);
    
    // Vérifier si nous devons ignorer la gestion d'erreur pour certaines routes
    if (request.url.includes('/auth/login') || request.url.includes('/auth/refresh-token')) {
      console.log('Route ignorée pour le rafraîchissement auto:', request.url);
      return throwError(() => new Error('Erreur d\'authentification'));
    }
    
    // Si nous sommes déjà en train de rafraîchir, attendre le résultat
    if (this.isRefreshing) {
      console.log('Refresh en cours, mise en attente de la requête');
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          if (token) {
            console.log('Token rafraîchi obtenu, relance de la requête');
            return next.handle(this.addToken(request, token));
          }
          
          console.warn('Échec de rafraîchissement détecté, redirection vers login');
          this.handleAuthError();
          return throwError(() => new Error('Session expirée'));
        })
      );
    }
    
    // Commencer un nouveau processus de rafraîchissement
    console.log('Démarrage du processus de rafraîchissement du token');
    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);
    
    // Tenter de rafraîchir le token via le AuthManagerService
    return this.refreshToken().pipe(
      switchMap((token: string | null) => {
        this.isRefreshing = false;
        
        if (token) {
          console.log('Token rafraîchi avec succès');
          // Notifier les requêtes en attente
          this.refreshTokenSubject.next(token);
          // Poursuivre la requête avec le nouveau token
          return next.handle(this.addToken(request, token));
        }
        
        console.warn('Échec du rafraîchissement de token, redirection vers login');
        this.handleAuthError();
        return throwError(() => new Error('Session expirée'));
      }),
      catchError(error => {
        console.error('Erreur pendant le rafraîchissement:', error);
        this.isRefreshing = false;
        this.handleAuthError();
        return throwError(() => error);
      }),
      finalize(() => {
        this.isRefreshing = false;
      })
    );
  }  private refreshToken(): Observable<any> {
    // Utiliser le service auth-manager pour rafraîchir le token
    console.log('Tentative de rafraîchissement du token via authManager');
    return this.authManager.refreshToken().pipe(
      switchMap(response => {
        if (response && response.success && response.token) {
          // Si le service retourne un token valide, l'utiliser
          console.log('Nouveau token obtenu:', response.token.substring(0, 15) + '...');
          return of(response.token);
        }
        // Sinon, retourner null
        console.warn('Aucun token retourné par le refresh');
        return of(null);
      }),
      catchError(error => {
        console.error('Erreur lors du rafraîchissement:', error);
        return of(null);
      })
    );
  }
    private handleAuthError(): void {
    // Supprimer toutes les informations d'authentification
    this.storageService.removeItem('authToken');
    this.storageService.removeItem('userRole');
    this.storageService.removeItem('userEmail');
    
    // Informer l'utilisateur et rediriger vers la page de connexion
    console.warn('Session expirée ou auth invalide - redirection vers login');
    
    // Temporiser légèrement pour éviter les redirections multiples
    setTimeout(() => {
      this.router.navigate(['/auth/login'], { 
        queryParams: { 
          expired: 'true',
          returnUrl: this.router.url,
          time: new Date().getTime() // Pour garantir une URL unique et éviter le cache
        }
      });
    }, 100);
  }
}
