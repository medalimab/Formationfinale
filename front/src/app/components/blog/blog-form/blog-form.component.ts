import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../../services/storage.service';
import { BlogService } from '../../../services/blog.service';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './blog-form.component.html',
  styleUrls: ['./blog-form.component.css']
})
export class BlogFormComponent implements OnInit {
  blogForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  isEditMode = false;
  blogId?: string;
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private blogService: BlogService
  ) {}

  ngOnInit(): void {
    // Initialiser le formulaire
    this.blogForm = this.formBuilder.group({
      titre: ['', [Validators.required]],
      contenu: ['', [Validators.required, Validators.minLength(50)]],
      image: [''],
      categories: [''],
      tags: ['']
    });

    // Vérifier si on est en mode édition
    this.route.params.subscribe(params => {
      this.blogId = params['id'];
      if (this.blogId) {
        this.isEditMode = true;
        this.loadBlogData(this.blogId);
      }
    });
  }

  // Getter pour accéder facilement aux champs du formulaire
  get f() { return this.blogForm.controls; }
  loadBlogData(id: string): void {
    this.loading = true;
    this.blogService.getArticle(id)
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            // Convertir les tableaux en chaînes pour l'édition
            const blog = response.data;
            const categoriesStr = blog.categories ? blog.categories.join(', ') : '';
            const tagsStr = blog.tags ? blog.tags.join(', ') : '';
            
            this.blogForm.patchValue({
              titre: blog.titre,
              contenu: blog.contenu,
              image: blog.image,
              categories: categoriesStr,
              tags: tagsStr
            });
          }
          this.loading = false;
        },
        error: error => {
          console.error('Erreur lors du chargement du blog:', error);
          this.error = 'Impossible de charger les données de l\'article';
          this.loading = false;
        }
      });
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
      this.blogForm.patchValue({ image: '' }); // On efface l'URL si upload
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.blogForm.patchValue({ image: '' });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.blogForm.invalid) {
      return;
    }
    this.loading = true;
    let formData: FormData | any;
    if (this.selectedFile) {
      formData = new FormData();
      formData.append('titre', this.blogForm.value.titre);
      formData.append('contenu', this.blogForm.value.contenu);
      formData.append('image', this.selectedFile);
      formData.append('categories', this.blogForm.value.categories);
      formData.append('tags', this.blogForm.value.tags);
    } else {
      formData = { ...this.blogForm.value };
    }
    if (formData.categories && typeof formData.categories === 'string') {
      formData.categories = formData.categories.split(',').map((cat: string) => cat.trim());
    }
    if (formData.tags && typeof formData.tags === 'string') {
      formData.tags = formData.tags.split(',').map((tag: string) => tag.trim());
    }
    if (this.isEditMode) {
      this.blogService.updateArticle(this.blogId!, formData)
        .subscribe({
          next: this.handleResponse.bind(this),
          error: (error) => {
            console.error('Erreur lors de la mise à jour du blog:', error);
            this.error = 'Erreur lors de la mise à jour: ' + (error.error?.message || error.message || 'erreur inconnue');
            this.loading = false;
          }
        });
    } else {
      this.blogService.createArticle(formData)
        .subscribe({
          next: this.handleResponse.bind(this),
          error: (error) => {
            console.error('Erreur lors de la création du blog:', error);
            this.error = 'Erreur lors de la création: ' + (error.error?.message || error.message || 'erreur inconnue');
            this.loading = false;
          }
        });
    }
  }

  handleResponse(response: any): void {
    if (response && response.success) {
      console.log('Blog enregistré avec succès!');
      if (this.storageService.getItem('userRole') === 'admin') {
        this.router.navigate(['/admin/blog']);
      } else {
        this.router.navigate(['/blog']);
      }
    } else {
      this.error = 'Une erreur est survenue lors de l\'enregistrement';
      this.loading = false;
    }
  }

  // Pour prévisualiser l'image
  previewImage(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.f['image'].setValue(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }
}
