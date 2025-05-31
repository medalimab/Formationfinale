
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private userRoleSubject = new BehaviorSubject<string | null>(this.getUserRole());
  
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public userRole$ = this.userRoleSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.checkToken();
  }

  private checkToken(): void {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      this.isAuthenticatedSubject.next(!!token);
    } else {
      this.isAuthenticatedSubject.next(false);
    }
  }

  private updateAuthState() {
    this.isAuthenticatedSubject.next(this.isLoggedIn());
    this.userRoleSubject.next(this.getUserRole());
  }

  login(credentials: { email: string; password: string }) {
    return this.http.post<{ success: boolean; token: string; role: string }>(
      `${this.apiUrl}/login`,
      credentials
    ).pipe(
      tap(res => {
        if (res && res.success && res.token) {
          localStorage.setItem('authToken', res.token);
          localStorage.setItem('userEmail', credentials.email);
          if (res.role) {
            localStorage.setItem('userRole', res.role);
          }
          this.updateAuthState();
        }
      })
    );
  }
  register(data: { name: string; email: string; password: string; role: string }) {
    // Adapter les clés au modèle du backend (nom au lieu de name)
    const backendData = {
      nom: data.name,
      email: data.email,
      password: data.password,
      role: data.role
    };
    
    return this.http.post<{ success: boolean; token: string; role: string }>(
      `${this.apiUrl}/register`,
      backendData
    );
  }

  isLoggedIn(): boolean {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      return !!token;
    }
    return false;
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
    }
    this.updateAuthState();
    this.router.navigate(['/login']);
  }

  getUserEmail(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userEmail');
    }
    return null;
  }
  
  getUserRole(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userRole');
    }
    return null;
  }
  
  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }
}