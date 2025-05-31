import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RendezVousService } from '../../../services/rendez-vous.service';
import { RendezVous } from '../../../models/rendez-vous.model';

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
  
  constructor(private rendezVousService: RendezVousService) { }

  ngOnInit(): void {
    this.fetchRendezVous();
  }
  
  fetchRendezVous(): void {
    this.loading = true;
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

  getServiceTitle(service: any): string {
    if (service && typeof service === 'object' && service.titre) {
      return service.titre;
    } else if (typeof service === 'string') {
      return service;
    }
    return 'Service non spécifié';
  }
}
