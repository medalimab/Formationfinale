import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, SlicePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ServiceApiService } from '../../../services/service-api.service';
import { Service } from '../../../models/service.model';
import { StorageService } from '../../../services/storage.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({  
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.css'],
  imports: [CommonModule, RouterModule, CurrencyPipe, SlicePipe, FormsModule],
  standalone: true
})
export class ServiceListComponent implements OnInit {
  services: Service[] = [];
  filteredServices: Service[] = [];  
  categories: string[] = [];
  selectedCategory: string = '';
  loading: boolean = false;
  error: string = '';
  userRole: string = 'user';
  searchTerm: string = '';

  // Variables de pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;

  constructor(
    private serviceApi: ServiceApiService,
    private storageService: StorageService
  ) { }
  
  ngOnInit(): void {
    this.loadServices();
    const role = this.storageService.getItem('userRole');
    this.userRole = role || 'user';
  }
  
  loadServices(): void {
    this.loading = true;
    this.serviceApi.getServices().subscribe(
      response => {
        this.services = response.data;
        this.extractCategories();
        this.applyFilters(); // Utilise applyFilters au lieu d'assigner directement
        this.loading = false;
      },
      error => {
        console.error('Erreur lors du chargement des services', error);
        this.error = 'Impossible de charger les services. Veuillez réessayer plus tard.';
        this.loading = false;
      }
    );
  }

  extractCategories(): void {
    // Extraire toutes les catégories uniques
    const categoriesSet = new Set<string>();
    this.services.forEach(service => {
      if (service.categorie) {
        categoriesSet.add(service.categorie);
      }
    });
    this.categories = Array.from(categoriesSet);
  }
  
  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  resetFilters(): void {
    this.selectedCategory = '';
    this.searchTerm = '';
    this.applyFilters();
  }
  
  applyFilters(): void {
    let filtered = this.services;
    
    // Filtre par catégorie
    if (this.selectedCategory) {
      filtered = filtered.filter(service => service.categorie === this.selectedCategory);
    }
    
    // Filtre par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(service => 
        service.titre.toLowerCase().includes(term) || 
        (service.description && service.description.toLowerCase().includes(term)) ||
        (service.categorie && service.categorie.toLowerCase().includes(term))
      );
    }
    
    this.filteredServices = filtered;
    
    // Recalculer les pages après le filtrage
    this.calculerPages();
    // Revenir à la première page
    this.currentPage = 1;
  }

  deleteService(id: string | undefined): void {
    if (!id) return;
    Swal.fire({
      title: 'Supprimer ce service ?',
      text: 'Cette action est irréversible. Voulez-vous vraiment supprimer ce service ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.serviceApi.deleteService(id).subscribe({
          next: () => {
            this.services = this.services.filter(s => s._id !== id);
            this.filteredServices = this.filteredServices.filter(s => s._id !== id);
            // Recalculer les pages après suppression
            this.calculerPages();
            Swal.fire('Supprimé !', 'Le service a été supprimé.', 'success');
          },
          error: (err) => {
            console.error('Erreur lors de la suppression du service :', err);
            if (err.status === 401) {
              Swal.fire({
                title: 'Erreur d\'authentification',
                text: 'Votre session a expiré. Veuillez vous reconnecter.',
                icon: 'warning',
                confirmButtonColor: '#4361ee'
              }).then(() => {
                window.location.href = '/auth/login';
              });
            } else {
              Swal.fire('Erreur', 'La suppression a échoué.', 'error');
            }
          }
        });
      }
    });
  }
  
  // Méthodes de pagination
  calculerPages(): void {
    this.totalPages = Math.ceil(this.filteredServices.length / this.itemsPerPage);
  }
  
  paginatedServices(): Service[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredServices.slice(startIndex, startIndex + this.itemsPerPage);
  }
  
  changerPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
  
  getPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}
