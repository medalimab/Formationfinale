import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthFixService } from '../services/auth-fix.service';
import { StorageService } from '../services/storage.service';

@Injectable()
export class FixedAuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private authFix: AuthFixService,
    private router: Router,
    private storageService: StorageService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log(`[FixedAuthInterceptor] Requête: ${request.method} ${request.url}`);

    // Ne pas ajouter de token pour les routes d'authentification
    if (
      request.url.includes('/auth/login') ||
      request.url.includes('/auth/register')
    ) {
      console.log('[FixedAuthInterceptor] Route d\'authentification - pas de token nécessaire');
      return next.handle(request);
    }

    // Récupérer le token
    const token = this.authFix.getToken();
    
    // Pour le rafraîchissement du token, toujours ajouter le token même s'il est expiré
    if (request.url.includes('/auth/refresh-token')) {
      if (token) {
        console.log('[FixedAuthInterceptor] Ajout du token à la requête de rafraîchissement');
        request = this.addToken(request, token);
      }
      return next.handle(request);
    }

    // Si nous n'avons pas de token, ne pas modifier la requête
    if (!token) {
      console.warn('[FixedAuthInterceptor] ATTENTION: Route protégée sans token disponible:', request.url);
      return next.handle(request).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            this.handleAuthError();
          }
          return throwError(() => error);
        })
      );
    }

    // Ajouter le token à la requête
    console.log('[FixedAuthInterceptor] Ajout du token à la requête', {
      url: request.url,
      method: request.method,
      headers: request.headers,
      token: token ? token.substring(0, 15) + '...' : null
    });
    request = this.addToken(request, token);

    // Intercepter les erreurs 401
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.warn(`[FixedAuthInterceptor] Erreur 401 pour ${request.url}`);
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          if (token) {
            console.log('[FixedAuthInterceptor] Utilisation du token rafraîchi');
            return next.handle(this.addToken(request, token));
          }
          
          this.handleAuthError();
          return throwError(() => new Error('Token non rafraîchi'));
        }),
        catchError(err => {
          console.error('[FixedAuthInterceptor] Erreur lors de l\'attente du token rafraîchi:', err);
          this.handleAuthError();
          return throwError(() => err);
        })
      );
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    console.log('[FixedAuthInterceptor] Tentative de rafraîchissement du token');

    return this.authFix.refreshToken().pipe(
      switchMap((response) => {
        this.isRefreshing = false;
        if (response && response.success && response.token) {
          this.refreshTokenSubject.next(response.token);
          console.log('[FixedAuthInterceptor] Token rafraîchi avec succès');
          return next.handle(this.addToken(request, response.token));
        } else {
          console.warn('[FixedAuthInterceptor] Échec du rafraîchissement du token');
          this.handleAuthError();
          return throwError(() => new Error('Échec du rafraîchissement du token'));
        }
      }),
      catchError(error => {
        this.isRefreshing = false;
        console.error('[FixedAuthInterceptor] Erreur lors du rafraîchissement:', error);
        this.handleAuthError();
        return throwError(() => error);
      }),
      finalize(() => {
        this.isRefreshing = false;
      })
    );
  }

  private handleAuthError(): void {
    console.warn('[FixedAuthInterceptor] Erreur d\'authentification - Redirection vers login');
    this.authFix.clearToken();
    
    setTimeout(() => {
      this.router.navigate(['/auth/login'], {
        queryParams: {
          expired: 'true',
          returnUrl: this.router.url,
          timestamp: new Date().getTime()
        }
      });
    }, 100);
  }
}
