// src/app/components/auth/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { JwtDebugService } from '../../../services/jwt-debug.service';
import { AuthManagerService } from '../../../services/auth-manager.service';
import { AuthFixService } from '../../../services/auth-fix.service';

@Component({  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  isLoading = false;
  returnUrl: string = '/formations';
  tokenExpired: boolean = false;
  
  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private authManager: AuthManagerService,
    private authFixService: AuthFixService,
    private router: Router,
    private route: ActivatedRoute,
    private jwtDebugService: JwtDebugService
  ) {
    // Suppression de la redirection automatique pour garantir le stockage du token
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }
  
  ngOnInit(): void {
    // Récupérer l'URL de retour et les paramètres de la requête
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || this.returnUrl;
      
      // Si le token a expiré (redirection depuis l'intercepteur)
      if (params['expired'] === 'true') {
        this.tokenExpired = true;
        this.errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
      }
    });
  }
  
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = null;
    
    // Utiliser le nouveau service authManager pour la connexion
    this.authManager.loginUser(this.loginForm.value).subscribe({
      next: (res) => {
        if (res && res.success && res.token) {
          // Stocker le token dans le localStorage via AuthFixService
          this.authFixService.setToken(res.token);
          this.onLoginSuccess(res.user); // Redirection après connexion
        }
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors de la connexion :', err);
        this.isLoading = false;
        
        if (err.status === 401) {
          this.errorMessage = 'Identifiants invalides';
        } else if (err.status === 0) {
          this.errorMessage = 'Impossible de se connecter au serveur';
        } else {
          this.errorMessage = err.error?.message || 'Erreur lors de la connexion';
        }
      }
    });
  }
  
  onLoginSuccess(user: any) {
    if (user && user.role === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/']);
    }
  }
}