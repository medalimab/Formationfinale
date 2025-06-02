import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthFixService } from '../../services/auth-fix.service';
import { AuthDiagnosticService } from '../../services/auth-diagnostic.service';
import { StorageService } from '../../services/storage.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-auth-check',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-4">
      <div class="card">
        <div class="card-header bg-primary text-white">
          <h2>Vérificateur d'Authentification</h2>
        </div>
        <div class="card-body">
          <!-- État de l'authentification -->
          <div class="mb-4">
            <h3>État actuel</h3>
            <div class="alert" [ngClass]="{'alert-success': hasToken, 'alert-danger': !hasToken}">
              <strong>Token:</strong> {{hasToken ? 'Présent' : 'Absent'}}
            </div>
            <div *ngIf="hasToken">
              <p><strong>Utilisateur:</strong> {{userEmail || 'Non spécifié'}}</p>
              <p><strong>Rôle:</strong> {{userRole || 'Non spécifié'}}</p>
              <p><strong>État du token:</strong> {{tokenStatus}}</p>
              <p><strong>Expire dans:</strong> {{tokenExpiresIn || 'N/A'}}</p>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="mb-4">
            <h3>Actions</h3>
            <div class="d-flex gap-2">
              <button class="btn btn-primary" (click)="checkToken()">
                Vérifier Token
              </button>
              <button class="btn btn-warning" (click)="forceRefreshToken()">
                Forcer Rafraîchissement
              </button>
              <button class="btn btn-danger" (click)="clearToken()">
                Supprimer Token
              </button>
            </div>
          </div>
          
          <!-- Résultat de la dernière action -->
          <div class="mb-4" *ngIf="lastActionResult">
            <h3>Résultat</h3>
            <div class="alert" [ngClass]="{'alert-success': lastActionSuccess, 'alert-danger': !lastActionSuccess}">
              {{lastActionResult}}
            </div>
            <pre *ngIf="lastActionData" class="bg-light p-3" style="max-height: 200px; overflow: auto;">{{lastActionData | json}}</pre>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AuthCheckComponent implements OnInit {
  hasToken: boolean = false;
  userEmail: string | null = null;
  userRole: string | null = null;
  tokenStatus: string = 'Inconnu';
  tokenExpiresIn: string | null = null;
  
  lastActionResult: string | null = null;
  lastActionSuccess: boolean = false;
  lastActionData: any = null;
  
  constructor(
    private authFix: AuthFixService,
    private authDiagnostic: AuthDiagnosticService,
    private http: HttpClient,
    private storage: StorageService
  ) {}
  
  ngOnInit(): void {
    this.updateStatus();
  }
  
  updateStatus(): void {
    this.hasToken = this.authFix.hasToken();
    this.userEmail = this.storage.getItem('userEmail');
    this.userRole = this.storage.getItem('userRole');
    
    if (this.hasToken) {
      const token = this.authFix.getToken();
      try {
        const payload = this.parseJwtPayload(token!);
        const now = Math.floor(Date.now() / 1000);
        if (payload && payload.exp) {
          if (now < payload.exp) {
            this.tokenStatus = 'Valide';
            const remainingTime = payload.exp - now;
            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;
            this.tokenExpiresIn = `${minutes}m ${seconds}s`;
          } else {
            this.tokenStatus = 'Expiré';
            const expiredSince = now - payload.exp;
            const minutes = Math.floor(expiredSince / 60);
            const seconds = expiredSince % 60;
            this.tokenExpiresIn = `Expiré depuis ${minutes}m ${seconds}s`;
          }
        }
      } catch (e) {
        this.tokenStatus = 'Format invalide';
        this.tokenExpiresIn = null;
      }
    }
  }
  
  checkToken(): void {
    this.lastActionResult = "Vérification du token...";
    this.authDiagnostic.checkTokenStatus().subscribe({
      next: (data) => {
        this.lastActionSuccess = data.success;
        this.lastActionResult = data.message;
        this.lastActionData = data;
        this.updateStatus();
      },
      error: (error) => {
        this.lastActionSuccess = false;
        this.lastActionResult = "Erreur lors de la vérification du token";
        this.lastActionData = error;
      }
    });
  }
  
  forceRefreshToken(): void {
    this.lastActionResult = "Rafraîchissement du token...";
    this.authFix.refreshToken().subscribe({
      next: (data) => {
        this.lastActionSuccess = data.success;
        this.lastActionResult = data.success ? 
          "Token rafraîchi avec succès" : 
          "Échec du rafraîchissement: " + data.message;
        this.lastActionData = data;
        this.updateStatus();
      },
      error: (error) => {
        this.lastActionSuccess = false;
        this.lastActionResult = "Erreur lors du rafraîchissement";
        this.lastActionData = error;
      }
    });
  }
  
  clearToken(): void {
    this.authFix.clearToken();
    this.lastActionSuccess = true;
    this.lastActionResult = "Token supprimé";
    this.lastActionData = null;
    this.updateStatus();
  }
  
  private parseJwtPayload(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Format de token JWT invalide');
    }
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    return JSON.parse(jsonPayload);
  }
}
