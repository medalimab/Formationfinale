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

  constructor(private temoignageService: TemoignageService, private authService: AuthService) {}

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    this.loadTemoignages();
  }

  // Méthode pour filtrer les témoignages en fonction du terme de recherche
  filterTemoignages(): void {
    if (!this.searchTerm.trim()) {
      this.filteredTemoignages = this.temoignages;
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredTemoignages = this.temoignages.filter(temoignage => 
      (temoignage.nom?.toLowerCase().includes(term) || 
       temoignage.commentaire?.toLowerCase().includes(term) ||
       temoignage.poste?.toLowerCase().includes(term) ||
       temoignage.entreprise?.toLowerCase().includes(term))
    );
  }

  loadTemoignages(): void {
    this.loading = true;
    // Afficher tous les témoignages pour l'admin, seulement les approuvés pour les autres
    const obs = this.userRole === 'admin'
      ? this.temoignageService.getTemoignages()
      : this.temoignageService.getTemoignagesApprouves();
    obs.subscribe({      next: res => {
        // Pour getTemoignages (admin), les données sont dans res.data.data (advancedResults)
        this.temoignages = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        this.filteredTemoignages = [...this.temoignages];
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
