import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DevisService } from '../../../services/devis.service';
import { ServiceApiService } from '../../../services/service-api.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Devis } from '../../../models/devis.model';

@Component({
  selector: 'app-devis-form',
  templateUrl: './devis-form.component.html',
  styleUrls: ['./devis-form.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class DevisFormComponent implements OnInit {
  devisForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  success = '';
  services: any[] = [];
  selectedServiceId: string | null = null;
  maxFileSize = 5 * 1024 * 1024; // 5MB
  allowedFileTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  selectedFiles: File[] = [];
  fileErrors: string[] = [];
  
  constructor(
    private formBuilder: FormBuilder,
    private devisService: DevisService,
    private serviceApi: ServiceApiService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.devisForm = this.formBuilder.group({
      service: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(50)]],
      fichiers: [[]]
    });
  }

  ngOnInit(): void {
    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isLoggedIn()) {
      this.snackBar.open('Vous devez être connecté pour demander un devis', 'Se connecter', {
        duration: 5000
      }).onAction().subscribe(() => {
        this.router.navigate(['/auth/login'], { 
          queryParams: { returnUrl: this.router.url } 
        });
      });
    }
    
    // Charger les services disponibles
    this.loadServices();
    
    // Récupérer le service ID depuis les paramètres d'URL
    this.route.queryParams.subscribe(params => {
      if (params['service']) {
        this.selectedServiceId = params['service'];
        this.devisForm.patchValue({ service: this.selectedServiceId });
      }
    });
  }

  // Getter pour faciliter l'accès aux champs du formulaire
  get f() { return this.devisForm.controls; }

  loadServices(): void {
    this.serviceApi.getServices().subscribe(
      response => {
        this.services = response.data || [];
      },
      error => {
        console.error('Erreur lors du chargement des services', error);
      }
    );
  }

  onFileChange(event: any): void {
    const files = event.target.files;
    this.fileErrors = [];
    
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Vérifier la taille du fichier
        if (file.size > this.maxFileSize) {
          this.fileErrors.push(`${file.name} : La taille du fichier dépasse 5MB`);
          continue;
        }
        
        // Vérifier le type du fichier
        if (!this.allowedFileTypes.includes(file.type)) {
          this.fileErrors.push(`${file.name} : Type de fichier non pris en charge`);
          continue;
        }
        
        this.selectedFiles.push(file);
      }
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';
    
    // Si le formulaire est invalide ou s'il y a des erreurs de fichiers, arrêtez-vous ici
    if (this.devisForm.invalid || this.fileErrors.length > 0) {
      return;
    }

    this.loading = true;
    
    // Dans un cas réel, vous auriez besoin d'un service pour télécharger les fichiers
    // et obtenir leurs URLs avant de soumettre le devis
    // Pour simplifier, on suppose que les fichiers sont déjà téléchargés
    const devisData: Omit<Devis, 'client' | 'dateDemande'> = {
      service: this.devisForm.value.service,
      description: this.devisForm.value.description,
      fichiers: this.selectedFiles.map(file => file.name),
      statut: 'en_attente'
    };
    this.devisService.createDevis(devisData).subscribe({
      next: (data: any) => {
        this.success = 'Votre demande de devis a été envoyée avec succès. Nous vous répondrons dans les plus brefs délais.';
        this.snackBar.open('Demande de devis envoyée avec succès!', 'Voir mes devis', {
          duration: 5000
        }).onAction().subscribe(() => {
          this.router.navigate(['/devis/mes-devis']);
        });
        this.devisForm.reset();
        this.selectedFiles = [];
        this.submitted = false;
        this.loading = false;
      },
      error: (error: any) => {
        this.error = error?.error?.message || 'Une erreur est survenue. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }
}
