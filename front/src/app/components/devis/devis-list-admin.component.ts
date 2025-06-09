import { Component, OnInit } from '@angular/core';
import { DevisService } from '../../services/devis.service';
import { Devis } from '../../models/devis.model';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-devis-list-admin',
  templateUrl: './devis-list-admin.component.html',
  styleUrls: ['./devis-list-admin.component.css', '../shared/loading-styles.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class DevisListAdminComponent implements OnInit {
  devisList: Devis[] = [];
  filteredDevisList: Devis[] = [];
  searchTerm: string = '';
  loading = true;
  error = '';

  // Variables de pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  constructor(private devisService: DevisService) {}

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
        
        // Gérer le cas où client est un objet ou une chaîne
        const clientName = typeof devis.client === 'object' && devis.client ? 
                        ((devis.client as any).nom || (devis.client as any).name || '') : 
                        (typeof devis.client === 'string' ? devis.client : '');
                        
        const clientEmail = typeof devis.client === 'object' && devis.client ? 
                        ((devis.client as any).email || '') : '';
        
        return serviceTitle.toLowerCase().includes(term) ||
               (devis.description || '').toLowerCase().includes(term) ||
               (devis.statut || '').toLowerCase().includes(term) ||
               clientName.toLowerCase().includes(term) ||
               clientEmail.toLowerCase().includes(term);
      });
    }
    
    // Recalculer les pages après le filtrage
    this.calculerPages();
    // Revenir à la première page quand on change le filtre
    this.currentPage = 1;
  }

  fetchDevis() {
    this.loading = true;
    this.devisService.getDevis().subscribe({
      next: res => {
        this.devisList = res.data || [];
        this.filteredDevisList = this.devisList;
        this.loading = false;
        // Calculer le nombre de pages après chargement
        this.calculerPages();
      },
      error: err => {
        this.error = err.error?.message || 'Erreur lors du chargement des devis';
        this.loading = false;
      }
    });
  }

  accepterDevis(devis: Devis) {
    const montantEstime = prompt('Montant estimé pour ce devis ? (optionnel)');
    const delaiEstime = prompt('Délai estimé pour ce devis ? (optionnel)');
    if (confirm('Confirmer l\'acceptation de ce devis ?')) {
      this.devisService.updateDevisStatut(devis._id!, {
        statut: 'accepte',
        montantEstime: montantEstime ? Number(montantEstime) : undefined,
        delaiEstime: delaiEstime || undefined
      }).subscribe({
        next: () => {
          this.fetchDevis();
        },
        error: () => {
          alert('Erreur lors de l\'acceptation du devis');
        }
      });
    }
  }

  refuserDevis(devis: Devis) {
    if (confirm('Confirmer le refus de ce devis ?')) {
      this.devisService.updateDevisStatut(devis._id!, { statut: 'refuse' }).subscribe({
        next: () => {
          this.fetchDevis();
        },
        error: () => {
          alert('Erreur lors du refus du devis');
        }
      });
    }
  }

  supprimerDevis(devis: Devis) {
    if (confirm('Supprimer définitivement ce devis ?')) {
      this.devisService.deleteDevis(devis._id!).subscribe({
        next: () => {
          this.fetchDevis();
        },
        error: () => {
          alert('Erreur lors de la suppression du devis');
        }
      });
    }
  }

  voirDevis(devis: Devis) {
    let serviceLabel = '';
    if (devis.service && typeof devis.service === 'object' && 'titre' in devis.service) {
      serviceLabel = (devis.service as any).titre;
    } else if (typeof devis.service === 'string' && devis.service.length === 24) {
      // Si c'est un id, essayons de trouver le nom dans la liste des services connus (optionnel)
      serviceLabel = 'Service inconnu';
    } else {
      serviceLabel = devis.service;
    }
    alert(
      `Client : ${devis.client?.nom || devis.client?.email || devis.client}\n` +
      `Service : ${serviceLabel}\n` +
      `Description : ${devis.description}\n` +
      `Date : ${devis.dateDemande}\n` +
      `Statut : ${devis.statut}\n` +
      (devis.montantEstime ? `Montant estimé : ${devis.montantEstime} €\n` : '') +
      (devis.delaiEstime ? `Délai estimé : ${devis.delaiEstime}\n` : '')
    );
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
