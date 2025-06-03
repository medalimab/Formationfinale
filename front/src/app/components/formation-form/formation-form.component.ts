import { Formation } from './../../models/formation.model';

import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormationService } from '../../services/formation.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-formation-form',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],  templateUrl: './formation-form.component.html',
  styleUrls: ['./formation-form.component.css']
})
export class FormationFormComponent implements OnInit {
  article: Formation = {
    titre: '',
    description: '',
    prix: 0,
    duree: '',
    categorie: '',
    image: ''
  };

  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  isUploading = false;
  isEditMode = false;
  isSubmitting = false;

  constructor(private formationService: FormationService, private router: Router, private route: ActivatedRoute) {}
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.formationService.getFormation(id).subscribe({
        next: (response) => {
          this.article = response.data;
          this.imagePreview = response.data.image ?? null;
        },error: (err) => {
          console.error('Erreur lors de la récupération de la formation :', err);
          Swal.fire({
            title: 'Erreur',
            text: 'Impossible de charger les données de la formation.',
            icon: 'error',
            confirmButtonColor: '#4361ee'
          });
        }
      });
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    
    if (file) {      
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          title: 'Fichier trop volumineux',
          text: 'Le fichier est trop volumineux (max 5MB)',
          icon: 'error',
          confirmButtonColor: '#4361ee'
        });
        return;
      }      
      if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
        Swal.fire({
          title: 'Format non supporté',
          text: 'Seuls les fichiers JPG/PNG sont acceptés',
          icon: 'error',
          confirmButtonColor: '#4361ee'
        });
        return;
      }

      this.selectedFile = file;

      
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          this.imagePreview = reader.result;
        } else {
          this.imagePreview = null; 
        }
      };
      reader.readAsDataURL(file);
    }
  }
  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.article.image = '';
  }  onSubmit(): void {
    if (this.isUploading) return;

    // Vérifions que toutes les données requises sont présentes
    if (!this.article.titre || !this.article.description || !this.article.categorie) {
      Swal.fire({
        title: 'Attention',
        text: 'Tous les champs obligatoires doivent être remplis',
        icon: 'warning',
        confirmButtonColor: '#4361ee'
      });
      return;
    }

    const formData = new FormData();
    formData.append('titre', this.article.titre);
    formData.append('categorie', this.article.categorie);
    formData.append('description', this.article.description);
    formData.append('prix', this.article.prix.toString());
    formData.append('duree', this.article.duree);
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    } else if (this.article.image) {
      // Si on est en mode édition et qu'une image existe déjà
      formData.append('imageUrl', this.article.image);
    }

    this.isUploading = true;
    
    if (this.isEditMode) {
      this.formationService.updateFormation(this.article._id!, formData).subscribe({
        next: (response) => {
          this.isUploading = false;
          Swal.fire({            
            title: 'Succès',
            text: 'Formation mise à jour avec succès !',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/formations']);
          });
        },        error: (err: any) => {
          console.error('Erreur lors de la mise à jour de la formation :', err);
          this.isUploading = false;
          
          if (err.status === 401) {
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
          } else {
            Swal.fire({
              title: 'Erreur',
              text: 'Une erreur est survenue lors de la mise à jour de la formation.',
              icon: 'error',
              confirmButtonColor: '#4361ee'
            });
          }
        }
      });
    } else {
      this.formationService.createFormation(formData).subscribe({
        next: (response) => {
          this.isUploading = false;
          Swal.fire({
            title: 'Succès',
            text: 'Formation créée avec succès !',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            this.router.navigate(['/formations']);
          });
        },        error: (err: any) => {
          console.error('Erreur lors de la création de la formation:', err);
          this.isUploading = false;
          
          if (err.status === 401) {
            Swal.fire({
              title: 'Erreur d\'authentification',
              text: 'Votre session a expiré. Veuillez vous reconnecter.',
              icon: 'warning',
              confirmButtonColor: '#4361ee'
            }).then(() => {
              this.router.navigate(['/auth/login'], { 
                queryParams: { returnUrl: '/formation/new' }
              });
            });
          } else {
            Swal.fire({
              title: 'Erreur',
              text: err.error?.message || 'Une erreur est survenue lors de l\'envoi',
              icon: 'error',
              confirmButtonColor: '#4361ee'
            });
          }
        }
      });
    }
  }

  onCancel(): void {
    // Redirige vers la liste ou réinitialise le formulaire selon le besoin
    window.history.back();
  }
}