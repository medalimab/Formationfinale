import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RendezVousService } from '../../../services/rendez-vous.service';
import { RendezVous } from '../../../models/rendez-vous.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-rendez-vous-list',
  templateUrl: './rendez-vous-list.component.html',
  styleUrls: ['./rendez-vous-list.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class RendezVousListComponent implements OnInit {
  rendezVousList: RendezVous[] = [];
  loading: boolean = true;
  error: string | null = null;
  userRole: string | null = null;

  constructor(private rendezVousService: RendezVousService, private authService: AuthService) { }

  ngOnInit(): void {
    // Correction : accepter aussi 'user' comme rôle client
    const role = this.authService.getUserRole();
    this.userRole = (role === 'user') ? 'client' : (role || 'client');
    this.fetchRendezVous();
  }
  
  fetchRendezVous(): void {
    this.loading = true;
    if (this.userRole === 'admin') {
      this.rendezVousService.getRendezVous().subscribe({
        next: (response) => {
          this.rendezVousList = response.data;
          this.loading = false;
        },
        error: (err) => {
          this.error = "Une erreur s'est produite lors du chargement des rendez-vous";
          this.loading = false;
          console.error(err);
        }
      });
    } else if (this.userRole === 'formateur') {
      this.rendezVousService.getRendezVousByFormateur().subscribe({
        next: (response) => {
          this.rendezVousList = response.data;
          this.loading = false;
        },
        error: (err) => {
          this.error = "Une erreur s'est produite lors du chargement de vos rendez-vous";
          this.loading = false;
          console.error(err);
        }
      });
    } else {
      this.rendezVousService.getMesRendezVous().subscribe({
        next: (response) => {
          this.rendezVousList = response.data;
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
