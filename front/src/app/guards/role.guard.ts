import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { AuthFixService } from '../services/auth-fix.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private storageService: StorageService,
    private authFixService: AuthFixService,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const requiredRoles = next.data['roles'] as Array<string>;
    
    if (!this.authFixService.hasToken()) {
      console.log('[RoleGuard] Pas de token, redirection vers login');
      this.redirectToLogin(state.url);
      return false;
    }

    // Vérifier d'abord que le token est valide
    return this.authFixService.ensureValidToken().pipe(
      map(token => {
        if (!token) {
          console.log('[RoleGuard] Token invalide, redirection vers login');
          this.redirectToLogin(state.url);
          return false;
        }

        // Vérifier ensuite le rôle
        const userRole = this.storageService.getItem('userRole');
        console.log(`[RoleGuard] Rôle utilisateur: ${userRole}, rôles requis: ${requiredRoles}`);
        
        if (!userRole || !requiredRoles.includes(userRole)) {
          console.log('[RoleGuard] Rôle non autorisé');
          this.router.navigate(['/']); // Redirection vers la page d'accueil
          return false;
        }
        
        console.log('[RoleGuard] Accès autorisé');
        return true;
      }),
      catchError(error => {
        console.error('[RoleGuard] Erreur:', error);
        this.redirectToLogin(state.url);
        return of(false);
      })
    );  }

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
