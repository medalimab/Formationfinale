import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { AuthFixService } from '../../services/auth-fix.service';
import { User } from '../../models/User.model';
import { FormationService } from '../../services/formation.service';
import { ServiceApiService } from '../../services/service-api.service';
import { StorageService } from '../../services/storage.service';

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
  
  activeTab: 'profile' | 'password' | 'history' | 'formations' | 'services' = 'profile';
  
  userFormations: any[] = [];
  loadingFormations = false;
  formationsError: string | null = null;
  
  userServices: any[] = [];
  loadingServices = false;
  servicesError: string | null = null;  constructor(
    private userService: UserService,
    private authService: AuthService,
    private authFixService: AuthFixService, // Ajout du nouveau service d'authentification
    private storageService: StorageService, // Ajout du service de stockage
    private fb: FormBuilder,
    private formationService: FormationService,
    private serviceApiService: ServiceApiService
  ) { }

  ngOnInit(): void {
    this.initForms();
    this.loadUserProfile();
  }
  
  loadUserFormations(): void {
    this.loadingFormations = true;
    this.formationsError = null;
    
    this.formationService.getUserFormations().subscribe({
      next: (response) => {
        this.userFormations = response.data || [];
        this.loadingFormations = false;
      },
      error: (err) => {
        this.formationsError = err.status === 404 ? 
          "Vous n'avez pas encore créé de formations" : 
          "Erreur lors du chargement des formations";
        this.loadingFormations = false;
        console.error('Erreur formations:', err);
      }
    });
  }
  
  loadUserServices(): void {
    this.loadingServices = true;
    this.servicesError = null;
    
    this.serviceApiService.getUserServices().subscribe({
      next: (response) => {
        this.userServices = response.data || [];
        this.loadingServices = false;
      },
      error: (err) => {
        this.servicesError = err.status === 404 ? 
          "Vous n'avez pas encore créé de services" : 
          "Erreur lors du chargement des services";
        this.loadingServices = false;
        console.error('Erreur services:', err);
      }
    });
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
    this.error = null;
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
      },      error: (err) => {
        this.error = "Erreur lors du chargement du profil";
        if (err.status === 401) {
          this.error += " - Veuillez vous reconnecter";
          this.authFixService.logout(); // Utilisation du nouveau service d'authentification
        } else if (err.status === 404) {
          this.error += " - URL API incorrecte";
        }
        this.loading = false;
        console.error('Erreur profile:', err);
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
        this.updateProfileSuccess = true;        this.updatingProfile = false;
        
        // Utiliser le nouveau service pour mettre à jour les données utilisateur
        if (response.data.email) {
          this.storageService.setItem('userEmail', response.data.email);
        }
        if (response.data.role) {
          this.storageService.setItem('userRole', response.data.role);
        }
      },      error: (err) => {
        this.updatingProfile = false;
        console.error('Erreur de mise à jour du profil:', err);
        
        if (err.status === 401) {
          this.error = "Session expirée. Veuillez vous reconnecter";
          this.authFixService.logout(); // Utilisation du nouveau service d'authentification
        } else {
          this.error = err.error?.message || "Erreur lors de la mise à jour du profil";
        }
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
      },      error: (err) => {
        this.updatingPassword = false;
        console.error('Erreur de mise à jour du mot de passe:', err);
        
        if (err.status === 401) {
          this.passwordError = "Session expirée. Veuillez vous reconnecter";
          this.authFixService.logout(); // Utilisation du nouveau service d'authentification
        } else {
          this.passwordError = err.error?.message || "Erreur lors de la mise à jour du mot de passe";
        }
      }
    });
  }
    switchTab(tab: 'profile' | 'password' | 'history' | 'formations' | 'services'): void {
    this.activeTab = tab;
    
    if (tab === 'formations' && this.userFormations.length === 0 && !this.loadingFormations) {
      this.loadUserFormations();
    }
    
    if (tab === 'services' && this.userServices.length === 0 && !this.loadingServices) {
      this.loadUserServices();
    }
  }
    logout(): void {
    this.authFixService.logout();
  }
}
