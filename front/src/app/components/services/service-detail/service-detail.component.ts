import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ServiceApiService } from '../../../services/service-api.service';
import { Service } from '../../../models/service.model';
import { DevisService } from '../../../services/devis.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-service-detail',
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe]
})
export class ServiceDetailComponent implements OnInit {
  serviceId: string = '';
  service: Service | null = null;
  loading: boolean = true;
  error: string | null = null;
  isAuthenticated: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviceApiService: ServiceApiService,
    private devisService: DevisService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isLoggedIn();
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.serviceId = id;
        this.fetchServiceDetails();
      } else {
        this.router.navigate(['/services']);
      }
    });
  }

  fetchServiceDetails(): void {
    this.loading = true;
    this.serviceApiService.getService(this.serviceId).subscribe({
      next: (response) => {
        this.service = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = "Une erreur s'est produite lors du chargement du service";
        this.loading = false;
        console.error(err);
      }
    });
  }

  demanderDevis(): void {
    if (this.isAuthenticated) {
      this.router.navigate(['/devis/new'], { 
        queryParams: { service: this.serviceId } 
      });
    } else {
      this.router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: `/services/${this.serviceId}` } 
      });
    }
  }

  prendreRendezVous(): void {
    if (this.isAuthenticated) {
      this.router.navigate(['/rendez-vous/new'], { 
        queryParams: { serviceId: this.serviceId } 
      });
    } else {
      this.router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: `/services/${this.serviceId}` } 
      });
    }
  }
}
