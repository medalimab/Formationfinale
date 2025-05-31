import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const requiredRoles = next.data['roles'] as Array<string>;
    
    return this.authService.currentUser.pipe(
      take(1),
      map(user => {
        // Si user est null ou si le rôle de l'utilisateur n'est pas dans les rôles requis
        if (!user || !user.role || !requiredRoles.includes(user.role)) {
          this.router.navigate(['/auth/login']);
          return false;
        }
        return true;
      })
    );
  }
}
