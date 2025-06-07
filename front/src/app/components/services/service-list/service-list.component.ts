import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, SlicePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ServiceApiService } from '../../../services/service-api.service';
import { Service } from '../../../models/service.model';
import { StorageService } from '../../../services/storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.css'],
  imports: [CommonModule, RouterModule, CurrencyPipe, SlicePipe],
  standalone: true
})
export class ServiceListComponent implements OnInit {
  services: Service[] = [];
  filteredServices: Service[] = [];  categories: string[] = [];
  selectedCategory: string = '';
  loading: boolean = false;
  error: string = '';
  userRole: string = 'user';

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
        this.filteredServices = this.services;
        this.extractCategories();
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
    if (!category) {
      this.filteredServices = this.services;
      return;
    }
    this.filteredServices = this.services.filter(service => service.categorie === category);
  }

  resetFilters(): void {
    this.selectedCategory = '';
    this.filteredServices = this.services;
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
}
