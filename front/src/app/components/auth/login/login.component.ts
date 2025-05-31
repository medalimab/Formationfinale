// src/app/components/auth/login/login.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  isLoading = false;
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    // Rediriger l'utilisateur s'il est déjà connecté
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/formations']);
    }
    
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = null;
    
    this.authService.login(this.loginForm.value).subscribe({      next: (res) => {
        if (res && res.success && res.token) {
          this.router.navigate(['/formations']);
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
}