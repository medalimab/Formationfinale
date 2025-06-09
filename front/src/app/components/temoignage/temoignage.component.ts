import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TemoignageService } from '../../services/temoignage.service';
import { Temoignage } from '../../models/temoignage.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-temoignage',
  templateUrl: './temoignage.component.html',
  styleUrls: ['./temoignage.component.css', '../shared/loading-styles.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TemoignageComponent implements OnInit {
  temoignages: Temoignage[] = [];
  filteredTemoignages: Temoignage[] = [];
  searchTerm: string = '';
  loading = false;
  error = '';
  newTemoignage: Partial<Temoignage> = { note: 5 };
  submitting = false;
  success = '';
  userRole: string | null = null;
  showForm = false; // Ajout de la variable pour gérer l'affichage du formulaire
  
  // Variables de pagination
  currentPage: number = 1;
  itemsPerPage: number = 6; // 6 témoignages par page (2 rangées de 3)
  totalPages: number = 0;

  constructor(private temoignageService: TemoignageService, private authService: AuthService) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.loadTemoignages();
  }
  // Méthode pour filtrer les témoignages en fonction du terme de recherche
  filterTemoignages(): void {
    if (!this.searchTerm.trim()) {
      this.filteredTemoignages = this.temoignages;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredTemoignages = this.temoignages.filter(temoignage => 
        (temoignage.nom?.toLowerCase().includes(term) || 
         temoignage.commentaire?.toLowerCase().includes(term) ||
         temoignage.poste?.toLowerCase().includes(term) ||
         temoignage.entreprise?.toLowerCase().includes(term))
      );
    }
    // Réinitialiser la pagination lorsqu'un filtre est appliqué
    this.currentPage = 1;
    this.calculerPages();
  }
  
  // Méthode pour calculer le nombre total de pages
  calculerPages(): void {
    this.totalPages = Math.ceil(this.filteredTemoignages.length / this.itemsPerPage);
  }

  // Retourne les témoignages à afficher sur la page courante
  paginatedTemoignages(): Temoignage[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredTemoignages.length);
    return this.filteredTemoignages.slice(startIndex, endIndex);
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

  loadTemoignages(): void {
    this.loading = true;
    // Afficher tous les témoignages pour l'admin, seulement les approuvés pour les autres
    const obs = this.userRole === 'admin'
      ? this.temoignageService.getTemoignages()
      : this.temoignageService.getTemoignagesApprouves();
    obs.subscribe({
      next: res => {
        // Pour getTemoignages (admin), les données sont dans res.data.data (advancedResults)
        this.temoignages = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        this.filteredTemoignages = [...this.temoignages];
        this.calculerPages(); // Calcul du nombre de pages après chargement des données
        this.loading = false;
      },
      error: () => {
        this.error = "Erreur lors du chargement des témoignages.";
        this.loading = false;
      }
    });
  }

  // Méthode pour afficher le formulaire
  afficherFormulaire(): void {
    this.showForm = true;
  }

  // Méthode pour masquer le formulaire après soumission ou annulation
  masquerFormulaire(): void {
    this.showForm = false;
  }

  submitTemoignage(): void {
    if (!this.newTemoignage.nom || !this.newTemoignage.commentaire || !this.newTemoignage.note) return;
    this.submitting = true;
    this.temoignageService.createTemoignage(this.newTemoignage as Temoignage).subscribe({
      next: () => {
        this.success = 'Merci pour votre témoignage ! Il sera publié après validation.';
        this.newTemoignage = { note: 5 };
        this.submitting = false;
        this.masquerFormulaire();
        this.loadTemoignages();
      },
      error: () => {
        this.error = "Erreur lors de l'envoi du témoignage.";
        this.submitting = false;
      }
    });
  }

  approuverDernierTemoignage(): void {
    if (!this.temoignages.length) return;
    const dernier = this.temoignages[this.temoignages.length - 1];
    if (!dernier._id) return;
    // Debug : log du token et du rôle
    console.log('Token envoyé :', localStorage.getItem('authToken'));
    console.log('Rôle utilisateur :', this.userRole);
    this.temoignageService.approuverTemoignage(dernier._id).subscribe({
      next: () => {
        this.success = 'Témoignage approuvé !';
        this.loadTemoignages();
      },
      error: (err) => {
        this.error = "Erreur lors de l'approbation du témoignage.";
        console.error('Erreur API approbation :', err);
      }
    });
  }

  approuverTemoignage(id: string): void {
    this.temoignageService.approuverTemoignage(id).subscribe({
      next: () => {
        this.success = 'Témoignage approuvé !';
        this.loadTemoignages();
      },
      error: (err) => {
        this.error = "Erreur lors de l'approbation du témoignage.";
        console.error('Erreur API approbation :', err);
      }
    });
  }

  supprimerTemoignage(id: string): void {
    if (!confirm('Voulez-vous vraiment supprimer ce témoignage ?')) return;
    this.temoignageService.deleteTemoignage(id).subscribe({
      next: () => {
        this.success = 'Témoignage supprimé !';
        this.loadTemoignages();
      },
      error: (err) => {
        this.error = "Erreur lors de la suppression du témoignage.";
        console.error('Erreur API suppression :', err);
      }
    });
  }
}
