import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/User.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  loading: boolean = true;
  error: string | null = null;
  
  profileForm!: FormGroup;
  updateProfileSuccess = false;
  updatingProfile = false;
  
  passwordForm!: FormGroup;
  updatePasswordSuccess = false;
  updatingPassword = false;
  passwordError: string | null = null;
  
  activeTab: 'profile' | 'password' | 'history' = 'profile';
  
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForms();
    this.loadUserProfile();
  }
  
  initForms(): void {
    this.profileForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });
    
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }
  
  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    return newPassword === confirmPassword ? null : { 'passwordMismatch': true };
  }
    loadUserProfile(): void {
    this.loading = true;
    this.userService.getProfile().subscribe({
      next: (response) => {
        this.user = response.data;
        if (this.user) {
          // Mettre à jour le formulaire avec les données de l'utilisateur
          this.profileForm.patchValue({
            nom: this.user.nom || '',
            email: this.user.email || ''
          });
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = "Erreur lors du chargement du profil";
        this.loading = false;
        console.error(err);
      }
    });
  }
  
  onSubmitProfile(): void {
    if (this.profileForm.invalid || this.updatingProfile) {
      return;
    }
    
    this.updatingProfile = true;
    this.updateProfileSuccess = false;
    
    const formData = this.profileForm.value;
    
    this.userService.updateProfile(formData).subscribe({
      next: (response) => {
        this.user = response.data;
        this.updateProfileSuccess = true;
        this.updatingProfile = false;
        // Mettre à jour les informations utilisateur dans le local storage si nécessaire
        this.authService.updateStoredUserData(response.data);
      },
      error: (err) => {
        this.error = err.error?.message || "Erreur lors de la mise à jour du profil";
        this.updatingProfile = false;
        console.error(err);
      }
    });
  }
  
  onSubmitPassword(): void {
    if (this.passwordForm.invalid || this.updatingPassword) {
      return;
    }
    
    this.updatingPassword = true;
    this.updatePasswordSuccess = false;
    this.passwordError = null;
    
    const formData = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };
    
    this.userService.updatePassword(formData).subscribe({
      next: (response) => {
        this.updatePasswordSuccess = true;
        this.updatingPassword = false;
        this.passwordForm.reset();
      },
      error: (err) => {
        this.passwordError = err.error?.message || "Erreur lors de la mise à jour du mot de passe";
        this.updatingPassword = false;
        console.error(err);
      }
    });
  }
  
  switchTab(tab: 'profile' | 'password' | 'history'): void {
    this.activeTab = tab;
  }
  
  logout(): void {
    this.authService.logout();
  }
}
