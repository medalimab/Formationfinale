import { Injectable } from '@angular/core';
import { 
  HttpRequest, 
  HttpHandler, 
  HttpEvent, 
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private storageService: StorageService
  ) {}
  
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
      console.error('Erreur lors du parsage du payload JWT', e);
      return null;
    }
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Une erreur est survenue';
        
        // Gestion des erreurs spécifiques
        if (error.status === 401) {
          errorMessage = 'Session expirée ou non autorisé';
          
          // Si l'utilisateur était connecté et que son token est invalide, le déconnecter
          const token = this.storageService.getItem('authToken');
          if (token) {
            console.warn('Token invalide, déconnexion automatique');
            this.storageService.removeItem('authToken');
            this.storageService.removeItem('userEmail');
            this.storageService.removeItem('userRole');
            
            // Redirection vers la page de connexion
            this.router.navigate(['/login'], { 
              queryParams: { expired: 'true' }
            });
          }
        } else if (error.status === 403) {
          errorMessage = 'Accès non autorisé';
        } else if (error.status === 404) {
          errorMessage = 'Ressource introuvable';
        } else if (error.status === 500) {
          errorMessage = 'Erreur serveur';
        }        console.error(`Erreur HTTP ${error.status}: ${errorMessage}`);
        console.error('URL de requête:', request.url);
        console.error('Méthode:', request.method);
          // Afficher les détails de l'erreur
        if (error.error) {
          console.error("Détails de l'erreur:", error.error);
          if (error.error.message) {
            errorMessage = error.error.message;
            console.error("Message d'erreur du serveur:", errorMessage);
          }
        }
        
        // Vérifier les problèmes courants
        if (request.url.includes('/api/')) {
          console.warn('URL API potentiellement malformée: vérifiez les doublons /api/');
        }
        
        // Afficher l'état de l'authentification
        const token = this.storageService.getItem('authToken');
        if (token) {
          console.info('État d\'authentification: Token présent');
          try {
            const payload = this.parseJwtPayload(token);
            const now = Math.floor(Date.now() / 1000);
            if (payload && payload.exp) {
              console.info('Token expiré?', now > payload.exp, 
                'Expire dans', payload.exp - now, 'secondes');
            }
          } catch (e) {
            console.error('Impossible d\'analyser le token:', e);
          }
        } else {
          console.info('État d\'authentification: Pas de token');
        }
        
        return throwError(() => error);
      })
    );
  }
}
