import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DevisService } from '../../services/devis.service';
import { Devis } from '../../models/devis.model';

@Component({
  selector: 'app-devis-list-client',
  templateUrl: './devis-list-client.component.html',
  styleUrls: ['./devis-list-client.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class DevisListClientComponent implements OnInit {
  devisList: Devis[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private devisService: DevisService) { }

  ngOnInit(): void {
    this.fetchDevis();
  }

  fetchDevis(): void {
    this.loading = true;
    this.devisService.getMesDevis().subscribe({
      next: (response) => {
        this.devisList = (response.data || []).map((devis: any) => {
          // Si le service est un string, on ne touche pas, sinon on garde l'objet
          return devis;
        });
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
