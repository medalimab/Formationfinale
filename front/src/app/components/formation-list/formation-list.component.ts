import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormationService } from '../../services/formation.service';
import { Formation } from '../../models/formation.model';
import { FormsModule } from '@angular/forms';
import { PanierService } from '../../services/panier.service';
import { StorageService } from '../../services/storage.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-formation-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './formation-list.component.html',
  styleUrls: ['./formation-list.component.css']
})
export class FormationListComponent implements OnInit {
  articles: Formation[] = [];
  isLoading = true;
  error: string | null = null;
  searchTerm = '';
  userRole: string = 'user'; 
  
  // Variables de pagination
  currentPage: number = 1;
  itemsPerPage: number = 8; 
  totalPages: number = 0;
  
  // Liste des catégories disponibles (pour référence uniquement, le filtrage a été supprimé)
  categories = ['Développement Web', 'Design', 'Marketing Digital', 'Data Science', 'Cybersécurité', 'Gestion De Projet'];

  constructor(
    private formationService: FormationService,
    private panierService: PanierService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.loadArticles();
    const role = this.storageService.getItem('userRole');
    this.userRole = role ? role : 'user';
  }

  loadArticles(): void {
    this.formationService.getFormations().subscribe({
      next: (response) => {
        this.articles = response.data;
        this.calculerPages();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des articles';
        this.isLoading = false;
        console.error(err);
      },
    });
  }

  calculerPages(): void {
    const articlesFiltrés = this.getFilteredArticles();
    this.totalPages = Math.ceil(articlesFiltrés.length / this.itemsPerPage);
  }

  // Méthode pour obtenir toutes les formations filtrées (sans pagination)
  getFilteredArticles(): Formation[] {
    let filtered = this.articles;

    // Filtre par recherche uniquement (le filtrage par catégorie a été supprimé)
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter((a: Formation) =>
        a.titre.toLowerCase().includes(term) ||
        a.categorie.toLowerCase().includes(term) ||
        a.description.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  // Méthode pour obtenir les formations de la page actuelle
  filteredArticles(): Formation[] {
    const filtered = this.getFilteredArticles();
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, filtered.length);
    
    return filtered.slice(startIndex, endIndex);
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

  deleteArticle(id: string): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Cette action est irréversible !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.formationService.deleteFormation(id).subscribe({
          next: () => {
            this.articles = this.articles.filter((a: Formation) => a._id !== id);
            this.calculerPages();
            Swal.fire('Supprimé !', 'La formation a été supprimée.', 'success');
          },
          error: (err: any) => {
            console.error('Erreur lors de la suppression de la formation :', err);
            Swal.fire('Erreur', 'La suppression a échoué.', 'error');
          }
        });
      }
    });
  }

  addToCart(article: Formation): void {
    this.panierService.addToPanier(article).subscribe({
      next: () => {
        Swal.fire({
          title: 'Ajouté au panier !',
          text: `${article.titre} a été ajouté au panier.`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          position: 'top-end',
          toast: true,
          timerProgressBar: true
        });
      },
      error: () => {
        Swal.fire('Erreur', 'Impossible d\'ajouter au panier', 'error');
      }
    });
  }
}