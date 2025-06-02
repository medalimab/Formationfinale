import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthFixService } from '../services/auth-fix.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authFixService: AuthFixService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    if (!this.authFixService.hasToken()) {
      console.log('[AuthGuard] Pas de token, redirection vers login');
      this.redirectToLogin(state.url);
      return false;
    }

    // Assurez-vous que le token est valide
    return this.authFixService.ensureValidToken().pipe(
      map(token => {
        if (token) {
          console.log('[AuthGuard] Token valide, accès autorisé');
          return true;
        } else {
          console.log('[AuthGuard] Token invalide, redirection vers login');
          this.redirectToLogin(state.url);
          return false;
        }
      }),
      catchError(() => {
        console.log('[AuthGuard] Erreur lors de la validation du token, redirection vers login');
        this.redirectToLogin(state.url);
        return of(false);
      })
    );
  }

  private redirectToLogin(returnUrl: string): void {
    this.router.navigate(['/auth/login'], { 
      queryParams: { 
        returnUrl, 
        expired: 'true',
        timestamp: new Date().getTime() 
      } 
    });
  }
}
