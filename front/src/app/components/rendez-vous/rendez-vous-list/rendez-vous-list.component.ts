import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RendezVousService } from '../../../services/rendez-vous.service';
import { RendezVous } from '../../../models/rendez-vous.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-rendez-vous-list',
  templateUrl: './rendez-vous-list.component.html',
  styleUrls: ['./rendez-vous-list.component.css', '../../shared/loading-styles.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class RendezVousListComponent implements OnInit {
  rendezVousList: RendezVous[] = [];
  filteredRendezVousList: RendezVous[] = [];
  searchTerm: string = '';
  loading: boolean = true;
  error: string | null = null;
  userRole: string | null = null;
  
  // Variables de pagination
  currentPage: number = 1;
  itemsPerPage: number = 5; 
  totalPages: number = 0;

  constructor(private rendezVousService: RendezVousService, private authService: AuthService) { }
  ngOnInit(): void {
    // Correction : accepter aussi 'user' comme rôle client
    const role = this.authService.getUserRole();
    this.userRole = (role === 'user') ? 'client' : (role || 'client');
    this.fetchRendezVous();
  }
  
  filterRendezVous(): void {
    if (!this.searchTerm.trim()) {
      this.filteredRendezVousList = this.rendezVousList;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredRendezVousList = this.rendezVousList.filter(rdv => {
        // Gérer le cas où service est un objet ou une chaîne
        const serviceTitle = typeof rdv.service === 'object' ? 
                             (rdv.service as any).titre : 
                             (typeof rdv.service === 'string' ? rdv.service : '');
        
        // Gérer le cas où client est un objet ou une chaîne
        const clientName = typeof rdv.client === 'object' && rdv.client ? 
                          ((rdv.client as any).nom || (rdv.client as any).name || '') : 
                          (typeof rdv.client === 'string' ? rdv.client : '');
        
        const clientEmail = typeof rdv.client === 'object' && rdv.client ? 
                           ((rdv.client as any).email || '') : '';
        
        return serviceTitle.toLowerCase().includes(term) ||
               (rdv.notes || '').toLowerCase().includes(term) ||
               rdv.statut.toLowerCase().includes(term) ||
               clientName.toLowerCase().includes(term) ||
               clientEmail.toLowerCase().includes(term) ||
               (rdv.date ? new Date(rdv.date).toLocaleDateString('fr-FR').includes(term) : false) ||
               (rdv.heure || '').toLowerCase().includes(term);
      });
    }
    // Réinitialiser la pagination lorsqu'un filtre est appliqué
    this.currentPage = 1;
    this.calculerPages();
  }
  
  // Méthode pour calculer le nombre total de pages
  calculerPages(): void {
    this.totalPages = Math.ceil(this.filteredRendezVousList.length / this.itemsPerPage);
  }

  // Retourne les rendez-vous à afficher sur la page courante
  paginatedRendezVous(): RendezVous[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredRendezVousList.length);
    return this.filteredRendezVousList.slice(startIndex, endIndex);
  }

  // Méthode pour changer de page
  changerPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Obtenir un tableau des numéros de page à afficher
  getPages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
    fetchRendezVous(): void {
    this.loading = true;
    if (this.userRole === 'admin') {
      this.rendezVousService.getRendezVous().subscribe({
        next: (response) => {
          this.rendezVousList = response.data;
          this.filteredRendezVousList = this.rendezVousList;
          this.calculerPages();
          this.loading = false;
        },
        error: (err) => {
          this.error = "Une erreur s'est produite lors du chargement des rendez-vous";
          this.loading = false;
          console.error(err);
        }
      });    } else if (this.userRole === 'formateur') {      this.rendezVousService.getRendezVousByFormateur().subscribe({
        next: (response) => {
          this.rendezVousList = response.data;
          this.filteredRendezVousList = this.rendezVousList;
          this.calculerPages();
          this.loading = false;
        },
        error: (err) => {
          this.error = "Une erreur s'est produite lors du chargement de vos rendez-vous";
          this.loading = false;
          console.error(err);
        }
      });    } else {      this.rendezVousService.getMesRendezVous().subscribe({
        next: (response) => {
          this.rendezVousList = response.data;
          this.filteredRendezVousList = this.rendezVousList;
          this.calculerPages();
          this.loading = false;
        },
        error: (err) => {
          this.error = "Une erreur s'est produite lors du chargement de vos rendez-vous";
          this.loading = false;
          console.error(err);
        }
      });
    }
  }
  
  getStatutClass(statut: string): string {
    switch (statut) {
      case 'confirme':
        return 'status-confirmed';
      case 'en_attente':
        return 'status-pending';
      case 'annule':
        return 'status-cancelled';
      case 'complete':
        return 'status-completed';
      default:
        return '';
    }
  }
  
  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'confirme':
        return 'Confirmé';
      case 'en_attente':
        return 'En attente';
      case 'annule':
        return 'Annulé';
      case 'complete':
        return 'Terminé';
      default:
        return statut;
    }
  }
  
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    });
  }
  
  annulerRendezVous(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      this.rendezVousService.updateRendezVousStatut(id, 'annule').subscribe({
        next: () => {
          this.fetchRendezVous();
        },
        error: (err) => {
          alert("Une erreur s'est produite lors de l'annulation du rendez-vous");
          console.error(err);
        }
      });
    }
  }

  deleteRendezVous(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      this.rendezVousService.deleteRendezVous(id).subscribe({
        next: () => {
          this.fetchRendezVous();
        },
        error: (err) => {
          alert("Une erreur s'est produite lors de la suppression du rendez-vous");
          console.error(err);
        }
      });
    }
  }

  // Affiche le nom du service au lieu de l'id
  getServiceTitle(service: any): string {
    if (!service) return '';
    if (typeof service === 'object' && service.titre) return service.titre;
    if (typeof service === 'string') return service; // fallback si pas peuplé
    return '';
  }
}
