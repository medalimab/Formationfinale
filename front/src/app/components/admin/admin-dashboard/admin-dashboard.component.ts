import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminUsersComponent } from '../admin-users.component';
import { UserService } from '../../../services/user.service';
import { FormationService } from '../../../services/formation.service';
import { ServiceApiService } from '../../../services/service-api.service';
import { DevisService } from '../../../services/devis.service';
import { RendezVousService } from '../../../services/rendez-vous.service';
import { BlogService } from '../../../services/blog.service';
import { TemoignageService } from '../../../services/temoignage.service';

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

  constructor(
    private userService: UserService,
    private formationService: FormationService,
    private serviceApi: ServiceApiService,
    private devisService: DevisService,
    private rendezVousService: RendezVousService,
    private blogService: BlogService,
    private temoignageService: TemoignageService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    Promise.all([
      this.userService.getUsers().toPromise(),
      this.formationService.getFormations(1, 1).toPromise(),
      this.serviceApi.getServices().toPromise(),
      this.devisService.getDevis().toPromise(),
      this.rendezVousService.getRendezVous().toPromise(),
      this.blogService.getArticles().toPromise(),
      this.temoignageService.getTemoignages().toPromise()
    ]).then(([users, formations, services, devis, rendezVous, blogs, temoignages]) => {
      this.counts = {
        users: Array.isArray(users?.data) ? users.data.length : (users?.data?.data?.length || 0),
        formations: formations?.count || (formations?.data?.length || 0),
        services: Array.isArray(services?.data) ? services.data.length : (services?.data?.length || 0),
        devis: Array.isArray(devis?.data) ? devis.data.length : (devis?.data?.length || 0),
        rendezVous: Array.isArray(rendezVous?.data) ? rendezVous.data.length : (rendezVous?.data?.length || 0),
        blogs: Array.isArray(blogs?.data) ? blogs.data.length : (blogs?.data?.length || 0),
        temoignages: Array.isArray(temoignages?.data) ? temoignages.data.length : (temoignages?.data?.length || 0)
      };
      this.loading = false;
    }).catch(() => {
      this.loading = false;
    });
  }
}
