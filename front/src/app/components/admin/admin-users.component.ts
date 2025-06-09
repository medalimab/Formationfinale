import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css', '../shared/loading-styles.css']
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm: string = '';
  loading = true;
  error: string | null = null;

  // Variables de pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  // Méthode pour calculer le nombre total de pages
  calculerPages(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  // Méthode pour obtenir les utilisateurs de la page courante
  paginatedUsers(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Méthode pour changer de page
  changerPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Méthode pour obtenir la liste des numéros de page à afficher
  getPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  filterUsers() {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = this.users;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredUsers = this.users.filter(user => 
        (user.name?.toLowerCase().includes(term) || 
         user.nom?.toLowerCase().includes(term) || 
         user.email?.toLowerCase().includes(term) ||
         user.role?.toLowerCase().includes(term))
      );
    }
    // Recalculer les pages après le filtrage
    this.currentPage = 1; // Réinitialiser à la première page
    this.calculerPages();
  }  fetchUsers() {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        this.users = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        this.filteredUsers = this.users;
        this.calculerPages(); // Calculer le nombre de pages
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Erreur lors du chargement des utilisateurs';
        this.loading = false;
      }
    });
  }

  deleteUser(id: string) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    this.userService.deleteUser(id).subscribe({
      next: () => this.fetchUsers(),
      error: (err: any) => alert(err.error?.message || 'Erreur lors de la suppression')
    });
  }
}
