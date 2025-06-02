import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { StorageService } from '../../services/storage.service';
import { FormsModule } from '@angular/forms';
import { AuthDiagnosticService } from '../../services/auth-diagnostic.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container mt-5">
      <h1>Page de débogage API</h1>
      <div class="card mb-4">
        <div class="card-header">
          <h2>État de l&apos;authentification</h2>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <strong>Authentifié :</strong> {{ authState.isAuthenticated ? 'Oui ✅' : 'Non ❌' }}
          </div>
          <div class="mb-3">
            <strong>Token présent :</strong> {{ authState.token ? 'Oui ✅' : 'Non ❌' }}
          </div>
          <div *ngIf="authState.token" class="mb-3">
            <strong>Token expiré :</strong> {{ authState.tokenExpired ? 'Oui ❌' : 'Non ✅' }}
          </div>
          <div *ngIf="authState.token" class="mb-3">
            <strong>Expire dans :</strong> {{ tokenExpiresIn }}
          </div>
          <div *ngIf="authState.token">
            <strong>Données du token :</strong>
            <pre class="mt-2 bg-light p-3">{{ authState.tokenData | json }}</pre>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header">
          <h2>Configuration API</h2>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <strong>URL API :</strong> {{ apiUrl }}
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header">
          <h2>Tester un endpoint API</h2>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label">Endpoint à tester</label>
            <div class="input-group">
              <span class="input-group-text">{{ apiUrl }}/</span>
              <input type="text" class="form-control" [(ngModel)]="endpoint" placeholder="users/me">
              <button class="btn btn-primary" (click)="testEndpoint()" [disabled]="loading">
                {{ loading ? 'Chargement...' : 'Tester' }}
              </button>
            </div>
          </div>
          
          <div *ngIf="testResult">
            <div class="mb-3">
              <strong>Statut :</strong> 
              <span [class]="testResult.success ? 'text-success' : 'text-danger'">
                {{ testResult.status }} {{ testResult.statusText }}
              </span>
            </div>
            
            <div class="mb-3">
              <strong>Réponse :</strong>
              <pre class="mt-2 bg-light p-3">{{ testResult.data | json }}</pre>
            </div>
          </div>

          <div *ngIf="testError" class="alert alert-danger">
            {{ testError }}
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header">
          <h2>Actions</h2>
        </div>
        <div class="card-body">
          <button class="btn btn-warning me-2" (click)="clearTokens()">Effacer les tokens</button>
          <button class="btn btn-danger me-2" (click)="clearStorage()">Vider le localStorage</button>
          <button class="btn btn-secondary" (click)="refreshPage()">Rafraîchir la page</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
    }
    pre {
      white-space: pre-wrap;
      word-break: break-word;
    }
  `]
})
export class DebugComponent implements OnInit {
  authState: any = {};
  apiUrl = environment.apiUrl;
  endpoint = 'users/me';
  loading = false;
  testResult: any = null;
  testError: string | null = null;
  tokenExpiresIn = '';
  constructor(
    private authDiagnosticService: AuthDiagnosticService,
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    this.refreshAuthState();
  }
  refreshAuthState() {
    // Récupérer le token du stockage
    const token = this.storageService.getItem('authToken');
    
    this.authState = {
      isAuthenticated: !!token,
      token: token
    };
    
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          this.authState.tokenData = payload;
          
          const expDate = new Date(payload.exp * 1000);
          const now = new Date();
          this.authState.tokenExpired = now > expDate;
          
          const diffMs = expDate.getTime() - now.getTime();
          const diffMins = Math.round(diffMs / 60000);
          
          if (diffMins > 0) {
            this.tokenExpiresIn = `${diffMins} minute(s)`;
          } else {
            this.tokenExpiresIn = 'Expiré';
          }
        }
      } catch (e) {
        console.error('Erreur lors du décodage du token:', e);
      }
    }
  }  testEndpoint() {
    this.loading = true;
    this.testResult = null;
    this.testError = null;
    
    // Tester l'endpoint en utilisant directement HttpClient
    const token = this.storageService.getItem('authToken');
    const headers: any = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
      firstValueFrom(
      this.http.get(`${this.apiUrl}/${this.endpoint}`, { headers, observe: 'response' })
    )
      .then((response: any) => {
        this.testResult = {
          success: true,
          status: response.status,
          statusText: response.statusText,
          data: response.body
        };
        
        // Ajouter les headers pour plus d'informations
        this.testResult.headers = {};
        response.headers.keys().forEach((key: string) => {
          this.testResult.headers[key] = response.headers.get(key);
        });
      })
      .catch((error: any) => {
        // Si erreur HTTP, construire un résultat avec les détails de l'erreur
        this.testResult = {
          success: false,
          status: error.status || 0,
          statusText: error.statusText || 'Erreur inconnue',
          data: error.error || {}
        };
        
        // Ajouter des informations supplémentaires pour le débogage
        if (this.testResult.status === 401) {
          this.testResult.authInfo = {
            tokenPresent: !!token,
            tokenState: this.authState,
            recommendation: 'Votre token est invalide ou expiré. Essayez de vous déconnecter et vous reconnecter.'
          };
        }
      })
      .finally(() => {
        this.loading = false;
      });
  }

  clearTokens() {
    this.storageService.removeItem('authToken');
    this.storageService.removeItem('userEmail');
    this.storageService.removeItem('userRole');
    this.refreshAuthState();
  }

  clearStorage() {
    localStorage.clear();
    this.refreshAuthState();
  }

  refreshPage() {
    window.location.reload();
  }
}
