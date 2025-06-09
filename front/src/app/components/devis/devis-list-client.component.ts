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

  constructor(private devisService: DevisService) { }

  ngOnInit(): void {
    this.fetchDevis();
  }  filterDevis(): void {
    if (!this.searchTerm.trim()) {
      this.filteredDevisList = this.devisList;
      return;
    }
    
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
}
