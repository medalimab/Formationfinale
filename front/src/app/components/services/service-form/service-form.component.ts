import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ServiceApiService } from '../../../services/service-api.service';
import { Service } from '../../../models/service.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './service-form.component.html',
  styleUrls: ['./service-form.component.css']
})
export class ServiceFormComponent implements OnInit {
  service: Service = {
    titre: '',
    description: '',
    prix: 0,
    categorie: '',
    caracteristiques: [],
    image: ''
  };
  
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  isUploading = false;
  isEditMode = false;
  newCaracteristique: string = '';
  
  constructor(
    private serviceApiService: ServiceApiService, 
    private router: Router, 
    private route: ActivatedRoute
  ) { }
  
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;      this.serviceApiService.getService(id).subscribe({
        next: (response: any) => {
          this.service = response.data;
          this.imagePreview = response.data.image ?? null;
        },
        error: (err: any) => {
          console.error('Erreur lors de la récupération du service :', err);
          Swal.fire({
            title: 'Erreur',
            text: 'Impossible de charger les données du service.',
            icon: 'error',
            confirmButtonColor: '#4361ee'
          });
        }
      });
    }
  }
    onFileChange(event: Event): void {
    const element = event.target as HTMLInputElement;
    const file = element.files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }
  
  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.service.image = '';
  }
  
  addCaracteristique(): void {
    if (this.newCaracteristique.trim()) {
      if (!this.service.caracteristiques) {
        this.service.caracteristiques = [];
      }
      this.service.caracteristiques.push(this.newCaracteristique.trim());
      this.newCaracteristique = '';
    }
  }
  
  removeCaracteristique(index: number): void {
    if (this.service.caracteristiques) {
      this.service.caracteristiques.splice(index, 1);
    }
  }
  onSubmit(): void {
    // Vérification stricte des champs obligatoires (trim)
    const titre = this.service.titre?.trim();
    const description = this.service.description?.trim();
    const categorie = this.service.categorie?.trim();
    const prix = this.service.prix;
    if (!titre || !description || !categorie || prix === undefined || prix === null || isNaN(prix) || prix <= 0) {
      Swal.fire({
        title: 'Champs obligatoires manquants',
        text: 'Veuillez remplir tous les champs obligatoires (titre, description, prix > 0, catégorie).',
        icon: 'warning',
        confirmButtonColor: '#4361ee'
      });
      this.isUploading = false;
      return;
    }
    this.isUploading = true;
    const formData = new FormData();
    formData.append('titre', titre);
    formData.append('description', description);
    formData.append('prix', prix.toString());
    formData.append('categorie', categorie);
    
    // Ajout des caractéristiques comme un tableau correct
    if (this.service.caracteristiques && this.service.caracteristiques.length > 0) {
      // Utiliser append pour chaque caractéristique séparément
      for (let i = 0; i < this.service.caracteristiques.length; i++) {
        formData.append('caracteristiques[]', this.service.caracteristiques[i]);
      }
    }
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    } else if (this.service.image) {
      formData.append('imageUrl', this.service.image);
    }
    
    const request = this.isEditMode 
      ? this.serviceApiService.updateService(this.service._id!, formData)
      : this.serviceApiService.createService(formData);
        request.subscribe({
      next: (response: any) => {
        Swal.fire({
          title: 'Succès',
          text: this.isEditMode ? 'Service mis à jour avec succès' : 'Service créé avec succès',
          icon: 'success',
          confirmButtonColor: '#4361ee'
        });
        this.router.navigate(['/services']);
      },      error: (error: any) => {
        console.error('Erreur:', error);
        this.isUploading = false;
        if (error.status === 401) {
          Swal.fire({
            title: 'Erreur d\'authentification',
            text: 'Votre session a expiré. Veuillez vous reconnecter.',
            icon: 'warning',
            confirmButtonColor: '#4361ee'
          }).then(() => {
            this.router.navigate(['/auth/login'], { 
              queryParams: { returnUrl: this.router.url }
            });
          });
        } else if (error.status === 400 || error.status === 422) {
          // Afficher le message d'erreur du backend
          Swal.fire({
            title: 'Erreur',
            text: error.error?.error || 'Erreur de validation. Vérifiez tous les champs.',
            icon: 'error',
            confirmButtonColor: '#4361ee'
          });
        } else {
          Swal.fire({
            title: 'Erreur',
            text: 'Une erreur est survenue lors de l\'enregistrement du service.',
            icon: 'error',
            confirmButtonColor: '#4361ee'
          });
        }
      },
      complete: () => {
        this.isUploading = false;
      }
    });
  }
}
