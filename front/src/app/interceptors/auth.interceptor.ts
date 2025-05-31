import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Récupère le token d'authentification du stockage local
    const token = localStorage.getItem('authToken');
    
    if (token) {
      // Clone la requête et ajoute l'en-tête d'autorisation
      const authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return next.handle(authRequest);
    }
    
    return next.handle(request);
  }
}
