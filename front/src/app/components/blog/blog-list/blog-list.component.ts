import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BlogService } from '../../../services/blog.service';
import { Blog } from '../../../models/blog.model';
import { AuthFixService } from '../../../services/auth-fix.service';
import { StorageService } from '../../../services/storage.service';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class BlogListComponent implements OnInit {
  articles: Blog[] = [];
  filteredArticles: Blog[] = [];
  searchTerm: string = '';
  loading: boolean = true;
  error: string | null = null;
  canCreateBlog: boolean = false;
  userRole: string = 'user';
  
  // Variables de pagination
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;
  
  constructor(
    private blogService: BlogService,
    private authFixService: AuthFixService,
    private storageService: StorageService
  ) { }
  
  ngOnInit(): void {
    this.fetchArticles();
    this.checkUserPermissions();
    const role = this.storageService.getItem('userRole');
    this.userRole = role || 'user';
  }
  
  checkUserPermissions(): void {
    const isLoggedIn = this.authFixService.hasToken();
    const userRole = this.storageService.getItem('userRole');
    this.canCreateBlog = isLoggedIn && (userRole === 'admin' || userRole === 'formateur');
  }

  fetchArticles(): void {
    this.loading = true;
    this.blogService.getArticles().subscribe({
      next: (response) => {
        this.articles = response.data;
        this.filteredArticles = this.articles;
        this.loading = false;
        // Calculer le nombre de pages après chargement
        this.calculerPages();
      },
      error: (err) => {
        this.error = "Une erreur s'est produite lors du chargement des articles";
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredArticles = this.articles;
    } else {
      this.filteredArticles = this.articles.filter(article =>
        article.titre.toLowerCase().includes(term) ||
        (article.contenu && article.contenu.toLowerCase().includes(term)) ||
        (article.categories && article.categories.some((cat: string) => cat.toLowerCase().includes(term)))
      );
    }
    // Recalculer les pages après le filtrage
    this.calculerPages();
    // Revenir à la première page
    this.currentPage = 1;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  truncateContent(content: string, maxLength: number = 150): string {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength) + '...';
  }

  deleteArticle(id: string | undefined): void {
    if (!id) return;
    if (this.userRole !== 'admin') return;
    Swal.fire({
      title: 'Supprimer cet article ?',
      text: 'Cette action est irréversible. Voulez-vous vraiment supprimer cet article ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.blogService.deleteArticle(id).subscribe({
          next: () => {
            this.articles = this.articles.filter(a => a._id !== id);
            this.filteredArticles = this.filteredArticles.filter(a => a._id !== id);
            // Recalculer les pages après suppression
            this.calculerPages();
            Swal.fire('Supprimé !', 'L\'article a été supprimé.', 'success');
          },
          error: (err) => {
            console.error('Erreur lors de la suppression de l\'article :', err);
            if (err.status === 404) {
              Swal.fire('Erreur', 'Article introuvable ou déjà supprimé.', 'error');
            } else {
              Swal.fire('Erreur', 'La suppression a échoué.', 'error');
            }
          }
        });
      }
    });
  }
  
  // Méthodes de pagination
  calculerPages(): void {
    this.totalPages = Math.ceil(this.filteredArticles.length / this.itemsPerPage);
  }
  
  paginatedArticles(): Blog[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredArticles.slice(startIndex, startIndex + this.itemsPerPage);
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
