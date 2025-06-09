import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DevisService } from '../../services/devis.service';
import { Devis } from '../../models/devis.model';

@Component({
  selector: 'app-devis-list-client',
  templateUrl: './devis-list-client.component.html',
  styleUrls: ['./devis-list-client.component.css', '../shared/loading-styles.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class DevisListClientComponent implements OnInit {
  devisList: Devis[] = [];
  filteredDevisList: Devis[] = [];
  searchTerm: string = '';
  loading: boolean = true;
  error: string | null = null;
  
  // Variables de pagination
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;

  constructor(private devisService: DevisService) { }

  ngOnInit(): void {
    this.fetchDevis();
  }  
  
  filterDevis(): void {
    if (!this.searchTerm.trim()) {
      this.filteredDevisList = this.devisList;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredDevisList = this.devisList.filter(devis => {
        // Gérer le cas où service est un objet ou une chaîne
        const serviceTitle = typeof devis.service === 'object' && devis.service ? 
                            (devis.service as any).titre : 
                            (typeof devis.service === 'string' ? devis.service : '');
        
        return serviceTitle.toLowerCase().includes(term) ||
              (devis.description || '').toLowerCase().includes(term) ||
              (devis.statut || '').toLowerCase().includes(term);
      });
    }
    // Recalculer les pages après le filtrage
    this.calculerPages();
    // Revenir à la première page quand on change le filtre
    this.currentPage = 1;
  }

  fetchDevis(): void {
    this.loading = true;
    this.devisService.getMesDevis().subscribe({
      next: (response) => {
        this.devisList = (response.data || []).map((devis: any) => {
          // Si le service est un string, on ne touche pas, sinon on garde l'objet
          return devis;
        });
        this.filteredDevisList = this.devisList;
        this.loading = false;
        // Calculer le nombre de pages après chargement
        this.calculerPages();
      },
      error: (err) => {
        this.error = "Erreur lors du chargement de vos devis.";
        this.loading = false;
      }
    });
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  getServiceTitle(service: any): string {
    if (!service) return '';
    if (typeof service === 'object' && service.titre) return service.titre;
    if (typeof service === 'string') return service;
    return '';
  }
  
  // Méthodes de pagination
  calculerPages(): void {
    this.totalPages = Math.ceil(this.filteredDevisList.length / this.itemsPerPage);
  }
  
  paginatedDevisList(): Devis[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredDevisList.slice(startIndex, startIndex + this.itemsPerPage);
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
