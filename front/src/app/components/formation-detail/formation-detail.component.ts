import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Formation } from '../../models/formation.model';
import { FormationService } from '../../services/formation.service';
import { AuthService } from '../../services/auth.service';
import { PanierService } from '../../services/panier.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-formation-detail',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './formation-detail.component.html',
  styleUrl: './formation-detail.component.css'
})
export class FormationDetailComponent implements OnInit {
  error: string | null = null;
  article: Formation | null = null;
  isLoading: boolean = true;
  userRole: string | null = null;

  constructor(
    private route: ActivatedRoute, 
    private formationService: FormationService,
    private authService: AuthService,
    private panierService: PanierService
  ) {
    this.userRole = this.authService.getUserRole();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('ID récupéré depuis l\'URL :', id);
    if (id) {
      this.formationService.getFormation(id).subscribe({
        next: (response) => {
          console.log('Détails de la formation récupérés :', response.data);
          this.article = response.data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erreur lors de la récupération de la formation :', err);
          this.error = 'Erreur lors du chargement de la formation';
          this.isLoading = false;
        }
      });
    } else {
      console.error('ID de la formation non fourni');
      this.error = 'ID de la formation non fourni';
      this.isLoading = false;
    }
  }

  addToCart(): void {
    if (this.article) {
      this.panierService.addToPanier(this.article).subscribe({
        next: () => {
          Swal.fire({
            title: 'Ajouté au panier !',
            text: `${this.article!.titre} a été ajouté au panier.`,
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

  isAdmin(): boolean {
    return this.userRole === 'admin' || this.userRole === 'formateur';
  }
}
