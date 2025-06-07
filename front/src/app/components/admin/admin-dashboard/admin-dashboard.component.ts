import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminUsersComponent } from '../admin-users.component';

interface DashboardCount {
  users?: number;
  formations?: number;
  services?: number;
  devis?: number;
  rendezVous?: number;
  blogs?: number;
  temoignages?: number;
}

interface DashboardLink {
  title: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AdminDashboardComponent implements OnInit {
  counts: DashboardCount = {};
  loading: boolean = true;
  
  adminLinks: DashboardLink[] = [
    { 
      title: 'Utilisateurs', 
      icon: 'bi-people-fill', 
      route: '/admin/users', 
      color: 'primary' 
    },
    { 
      title: 'Formations', 
      icon: 'bi-book-fill', 
      route: '/admin/formations', 
      color: 'success' 
    },
    { 
      title: 'Services', 
      icon: 'bi-gear-fill', 
      route: '/admin/services', 
      color: 'info' 
    },
    { 
      title: 'Blog', 
      icon: 'bi-newspaper', 
      route: '/admin/blog', 
      color: 'warning' 
    },
    { 
      title: 'Devis', 
      icon: 'bi-file-text-fill', 
      route: '/admin/devis', 
      color: 'secondary' 
    },
    { 
      title: 'Rendez-vous', 
      icon: 'bi-calendar-check-fill', 
      route: '/admin/rendez-vous', 
      color: 'danger' 
    },
    { 
      title: 'Témoignages', 
      icon: 'bi-chat-quote-fill', 
      route: '/admin/temoignages', 
      color: 'dark' 
    },
    { 
      title: 'Messages', 
      icon: 'bi-envelope-fill', 
      route: '/admin/contacts', 
      color: 'primary' 
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Ici, vous pourriez appeler différentes API pour obtenir les comptes
    // pour le tableau de bord. Pour l'instant, nous simulons les données.
    setTimeout(() => {
      this.counts = {
        users: 120,
        formations: 45,
        services: 18,
        devis: 32,
        rendezVous: 27,
        blogs: 15,
        temoignages: 24
      };
      this.loading = false;
    }, 1000);
  }
}
