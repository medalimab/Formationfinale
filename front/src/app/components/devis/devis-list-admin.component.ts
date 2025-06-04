import { Component, OnInit } from '@angular/core';
import { DevisService } from '../../services/devis.service';
import { Devis } from '../../models/devis.model';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-devis-list-admin',
  templateUrl: './devis-list-admin.component.html',
  styleUrls: ['./devis-list-admin.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class DevisListAdminComponent implements OnInit {
  devisList: Devis[] = [];
  loading = true;
  error = '';

  constructor(private devisService: DevisService) {}

  ngOnInit(): void {
    this.fetchDevis();
  }

  fetchDevis() {
    this.loading = true;
    this.devisService.getDevis().subscribe({
      next: res => {
        this.devisList = res.data || [];
        this.loading = false;
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
}
