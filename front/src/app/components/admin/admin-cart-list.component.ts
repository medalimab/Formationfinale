import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanierService } from '../../services/panier.service';
import { Panier } from '../../models/panier.model';
import { RouterModule } from '@angular/router';
import { User } from '../../models/User.model';
import { FormsModule } from '@angular/forms';

// On ne fait pas extends, on redéfinit le type localement pour user: User | string
export type PanierWithUser = Omit<Panier, 'user'> & { user: User | string };

@Component({
  selector: 'app-admin-cart-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-cart-list.component.html',
  styleUrls: ['./admin-cart-list.component.css']
})
export class AdminCartListComponent implements OnInit {
  paniers: PanierWithUser[] = [];
  filteredPaniers: PanierWithUser[] = [];
  loading = true;
  error = '';
  searchTerm: string = '';

  constructor(private panierService: PanierService) {}

  ngOnInit(): void {
    this.fetchAllPaniers();
  }

  fetchAllPaniers() {
    this.loading = true;
    this.panierService.getAllPaniers().subscribe({
      next: (data) => {
        this.paniers = (data as PanierWithUser[]).filter(panier => {
          if (!panier.user || typeof panier.user !== 'object') return true;
          const user = panier.user as User;
          if (user.role === 'admin') return false;
          if (user.email && user.email.toLowerCase() === 'test@example.com') return false;
          return true;
        });
        this.applySearch();
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Erreur lors du chargement des paniers';
        this.loading = false;
      }
    });
  }

  applySearch(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredPaniers = this.paniers;
      return;
    }
    this.filteredPaniers = this.paniers.filter(panier => {
      if (panier.user && typeof panier.user === 'object') {
        const user = panier.user as User;
        return (
          (user.nom && user.nom.toLowerCase().includes(term)) ||
          (user.email && user.email.toLowerCase().includes(term))
        );
      }
      return false;
    });
  }

  onSearchChange(): void {
    this.applySearch();
  }

  getClientName(panier: PanierWithUser): string {
    if (panier.user && typeof panier.user === 'object' && 'nom' in panier.user) {
      const user = panier.user as User;
      return `${user.nom || ''}`.trim() || user.email || 'Utilisateur inconnu';
    }
    return 'Utilisateur inconnu';
  }

  getClientEmail(panier: PanierWithUser): string | null {
    if (panier.user && typeof panier.user === 'object' && 'email' in panier.user) {
      return (panier.user as User).email || null;
    }
    return null;
  }

  /**
   * Supprimer un panier (admin)
   */
  deletePanier(panierId: string): void {
    if (!panierId) return;
    this.panierService.deletePanierAdmin(panierId).subscribe({
      next: () => this.fetchAllPaniers(),
      error: (err) => alert('Erreur lors de la suppression du panier')
    });
  }

  /**
   * Mettre à jour un panier (admin)
   */
  updatePanier(panierId: string, data: Partial<Panier>): void {
    if (!panierId) return;
    this.panierService.updatePanierAdmin(panierId, data).subscribe({
      next: () => this.fetchAllPaniers(),
      error: (err) => alert('Erreur lors de la mise à jour du panier')
    });
  }
}
