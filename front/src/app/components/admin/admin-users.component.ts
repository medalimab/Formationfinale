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

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }
  filterUsers() {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = this.users;
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user => 
      (user.name?.toLowerCase().includes(term) || 
       user.nom?.toLowerCase().includes(term) || 
       user.email?.toLowerCase().includes(term) ||
       user.role?.toLowerCase().includes(term))
    );
  }
  fetchUsers() {
    this.loading = true;
    this.userService.getUsers().subscribe({
      next: (res: any) => {
        this.users = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        this.filteredUsers = this.users;
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
