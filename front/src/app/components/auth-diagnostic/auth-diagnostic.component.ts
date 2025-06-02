import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthDiagnosticService } from '../../services/auth-diagnostic.service';
import { StorageService } from '../../services/storage.service';
import { AuthFixService } from '../../services/auth-fix.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-auth-diagnostic',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-5">
      <h1>Diagnostic d'Authentification</h1>
      
      <div class="alert alert-info">
        Cette page vous aide à diagnostiquer les problèmes d'authentification.
      </div>
      
      <div class="row mt-4">
        <div class="col-md-6">
          <div class="card mb-4">
            <div class="card-header bg-primary text-white">
              <h3>Information de stockage local</h3>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <strong>Token présent :</strong> 
                {{ hasToken ? 'Oui ✅' : 'Non ❌' }}
              </div>
              <div *ngIf="hasToken" class="mb-3">
                <strong>Token :</strong> 
                <span class="text-muted">{{ tokenPreview }}</span>
              </div>
              <div class="mb-3">
                <strong>Rôle utilisateur :</strong> 
                {{ userRole || 'Non défini ❌' }}
              </div>
              <div class="mb-3">
                <strong>Email utilisateur :</strong> 
                {{ userEmail || 'Non défini ❌' }}
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card mb-4">
            <div class="card-header bg-primary text-white">
              <h3>Diagnostic du Token</h3>
            </div>
            <div class="card-body">
              <div *ngIf="loading" class="text-center">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Chargement...</span>
                </div>
              </div>
              
              <div *ngIf="!loading">
                <div class="mb-3">
                  <strong>Status du token :</strong> 
                  <span [class]="'badge ' + getTokenStatusBadgeClass()">
                    {{ tokenStatus }}
                  </span>
                </div>
                
                <div *ngIf="tokenDetails" class="mb-3">
                  <strong>Détails :</strong>
                  <pre class="bg-light p-2 mt-2">{{ tokenDetails | json }}</pre>
                </div>
              </div>
              
              <button class="btn btn-primary mt-3" (click)="checkToken()" [disabled]="loading">
                <span *ngIf="loading">Vérification...</span>
                <span *ngIf="!loading">Vérifier le token</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card mb-4">
        <div class="card-header bg-primary text-white">
          <h3>Actions</h3>
        </div>
        <div class="card-body">
          <button class="btn btn-warning me-2" (click)="refreshToken()" [disabled]="loading">
            Rafraîchir le token
          </button>
          <button class="btn btn-danger me-2" (click)="clearTokens()" [disabled]="loading">
            Effacer les tokens
          </button>
          <button class="btn btn-info" (click)="diagnose()" [disabled]="loading">
            Diagnostiquer les problèmes
          </button>
        </div>
      </div>
      
      <div class="card mb-4">
        <div class="card-header bg-primary text-white">
          <h3>Configuration</h3>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <strong>API URL :</strong> {{ apiUrl }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    pre {
      max-height: 300px;
      overflow: auto;
    }
    .badge {
      padding: 0.5em 0.8em;
    }
  `]
})
export class AuthDiagnosticComponent implements OnInit {
  hasToken: boolean = false;
  tokenPreview: string = '';
  userRole: string | null = null;
  userEmail: string | null = null;
  apiUrl: string = environment.apiUrl;
  
  tokenStatus: string = 'Non vérifié';
  tokenDetails: any = null;
  loading: boolean = false;

  constructor(
    private authDiagnosticService: AuthDiagnosticService,
    private storageService: StorageService,
    private authFixService: AuthFixService
  ) {}

  ngOnInit() {
    this.loadStorageData();
  }

  loadStorageData() {
    const token = this.storageService.getItem('authToken');
    this.hasToken = !!token;
    
    if (token) {
      this.tokenPreview = token.substring(0, 15) + '...';
    }
    
    this.userRole = this.storageService.getItem('userRole');
    this.userEmail = this.storageService.getItem('userEmail');
  }

  checkToken() {
    this.loading = true;
    this.authDiagnosticService.checkTokenStatus().subscribe({
      next: (response) => {
        this.tokenStatus = response.status === 'valid' ? 'Valide' : 
                          response.status === 'expired' ? 'Expiré' :
                          response.status === 'missing' ? 'Manquant' : 'Invalide';
                          
        this.tokenDetails = response.data || response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la vérification du token:', error);
        this.tokenStatus = 'Erreur de vérification';
        this.tokenDetails = error;
        this.loading = false;
      }
    });
  }

  refreshToken() {
    this.loading = true;
    this.authFixService.refreshToken().subscribe({
      next: (response) => {
        console.log('Réponse de rafraîchissement:', response);
        this.loadStorageData();
        this.checkToken();
      },
      error: (error) => {
        console.error('Erreur lors du rafraîchissement du token:', error);
        this.loading = false;
      }
    });
  }

  clearTokens() {
    this.authFixService.clearToken();
    this.loadStorageData();
    this.tokenStatus = 'Tokens effacés';
    this.tokenDetails = null;
  }

  diagnose() {
    this.loading = true;
    this.authDiagnosticService.diagnoseAuthIssues().then(result => {
      console.log('Diagnostic terminé:', result);
      this.loadStorageData();
      this.loading = false;
    });
  }

  getTokenStatusBadgeClass() {
    switch (this.tokenStatus) {
      case 'Valide': return 'bg-success';
      case 'Expiré': return 'bg-warning';
      case 'Manquant': return 'bg-danger';
      case 'Invalide': return 'bg-danger';
      case 'Tokens effacés': return 'bg-info';
      default: return 'bg-secondary';
    }
  }
}
