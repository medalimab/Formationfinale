import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, SlicePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ServiceApiService } from '../../../services/service-api.service';
import { Service } from '../../../models/service.model';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrls: ['./service-list.component.css'],
  imports: [CommonModule, RouterModule, CurrencyPipe, SlicePipe],
  standalone: true
})
export class ServiceListComponent implements OnInit {
  services: Service[] = [];
  filteredServices: Service[] = [];
  categories: string[] = [];
  selectedCategory: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(private serviceApi: ServiceApiService) { }

  ngOnInit(): void {
    this.loadServices();
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
}
