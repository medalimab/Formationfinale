// src/app/components/auth/register/register.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string | null = null;
  isLoading = false;  roles = [
    { label: 'Client', value: 'user' },
    { label: 'Formateur', value: 'formateur' },
    { label: 'Administrateur', value: 'admin' }
  ];
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    // Rediriger l'utilisateur s'il est déjà connecté
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/formations']);
    }
    
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['user', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;
    this.errorMessage = null;
    const formValues = this.registerForm.value;
    
    this.authService.register(formValues).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors de l\'inscription :', err);
        this.isLoading = false;
        
        if (err.status === 400) {
          if (err.error?.message?.includes('email')) {
            this.errorMessage = 'Cet email est déjà utilisé';
          } else {
            this.errorMessage = err.error?.message || 'Veuillez vérifier vos informations';
          }
        } else if (err.status === 0) {
          this.errorMessage = 'Impossible de se connecter au serveur';
        } else {
          this.errorMessage = err.error?.message || 'Erreur lors de l\'inscription';
        }
      }
    });
  }
}