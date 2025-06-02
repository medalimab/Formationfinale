
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';
import { JwtDebugService } from './jwt-debug.service';
import { AuthManagerService } from './auth-manager.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private userRoleSubject = new BehaviorSubject<string | null>(this.getUserRole());
  private currentUserSubject = new BehaviorSubject<any>(this.getStoredUserData());
  
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public userRole$ = this.userRoleSubject.asObservable();
  public currentUser = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private router: Router,
    private storageService: StorageService,
    private jwtDebugService: JwtDebugService,
    private authManager: AuthManagerService
  ) {
    this.checkToken();
    
    // S'abonner aux changements de statut d'authentification du AuthManagerService
    this.authManager.authStatus$.subscribe(status => {
      this.isAuthenticatedSubject.next(status);
      this.userRoleSubject.next(this.getUserRole());
    });
  }
  
  private checkToken(): void {
    const tokenStatus = this.jwtDebugService.decodeJwt();
    this.isAuthenticatedSubject.next(tokenStatus.valid && !tokenStatus.expired);
  }

  private updateAuthState() {
    this.isAuthenticatedSubject.next(this.isLoggedIn());
    this.userRoleSubject.next(this.getUserRole());
  }
  login(credentials: { email: string; password: string }) {
    // Déléguer au nouveau service d'authentification
    return this.authManager.loginUser(credentials).pipe(
      tap(res => {
        if (res && res.success && res.token) {
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
    const token = this.storageService.getItem('authToken');
    return !!token;
  }  logout(): void {
    // Déléguer au nouveau service d'authentification
    this.authManager.logout();
    this.updateAuthState();
  }
  getUserEmail(): string | null {
    return this.storageService.getItem('userEmail');
  }
    getUserRole(): string | null {
    return this.storageService.getItem('userRole');
  }
    isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }
    getStoredUserData(): any {
    const email = this.storageService.getItem('userEmail');
    const role = this.storageService.getItem('userRole');
    
    if (email && role) {
      return { email, role };
    }
    return null;
  }
    updateStoredUserData(userData: any): void {
    if (userData) {
      if (userData.email) {
        this.storageService.setItem('userEmail', userData.email);
      }
      
      if (userData.role) {
        this.storageService.setItem('userRole', userData.role);
      }
      
      this.currentUserSubject.next(userData);
    }
  }
}