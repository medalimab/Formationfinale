import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PanierService } from '../../services/panier.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSignOutAlt, faList, faPlus, faUser, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  // Icônes FontAwesome
  faSignOutAlt = faSignOutAlt;
  faList = faList;
  faPlus = faPlus;
  faUser = faUser;
  faShoppingCart = faShoppingCart;

  userEmail: string | null = null;
  userRole: string | null = null;
  cartCount: number = 0;
  
  // États des menus déroulants
  isUserDropdownOpen: boolean = false;
  isFormationDropdownOpen: boolean = false;
  isAdminDropdownOpen: boolean = false;
  
  private authSubscription: Subscription | null = null;

  constructor(
    public authService: AuthService, 
    private panierService: PanierService,
    public router: Router // Ajout du Router en public pour le template
  ) {}
  
  ngOnInit(): void {
    // Initialiser les valeurs
    this.userEmail = this.authService.getUserEmail();
    this.userRole = this.authService.getUserRole();
    this.updateCartCount();
    
    // S'abonner aux changements d'authentification
    this.authSubscription = this.authService.isAuthenticated$.subscribe(() => {
      this.userEmail = this.authService.getUserEmail();
      this.userRole = this.authService.getUserRole();
    });
    
    // Ajout dynamique de la classe admin-dashboard au body pour le décalage du contenu
    this.router.events.subscribe(() => {
      if (this.userRole === 'admin' && this.router.url.startsWith('/admin')) {
        document.body.classList.add('admin-dashboard');
      } else {
        document.body.classList.remove('admin-dashboard');
      }
    });
  }
  
  ngOnDestroy(): void {
    // Se désabonner pour éviter les fuites de mémoire
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  updateCartCount(): void {
    this.panierService.getPanierFromServer().subscribe({
      next: (panier) => {
        this.cartCount = panier?.formations?.length || 0;
      },
      error: () => {
        this.cartCount = 0;
      }
    });
  }
  logout(): void {
    this.authService.logout();
  }
  
  toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
    this.isFormationDropdownOpen = false;
    this.isAdminDropdownOpen = false;
  }
  
  toggleFormationDropdown(): void {
    this.isFormationDropdownOpen = !this.isFormationDropdownOpen;
    this.isUserDropdownOpen = false;
    this.isAdminDropdownOpen = false;
  }
  
  toggleAdminDropdown(): void {
    this.isAdminDropdownOpen = !this.isAdminDropdownOpen;
    this.isUserDropdownOpen = false;
    this.isFormationDropdownOpen = false;
  }
  
  // Fermer tous les menus déroulants en cliquant à l'extérieur
  closeAllDropdowns(): void {
    this.isUserDropdownOpen = false;
    this.isFormationDropdownOpen = false;
    this.isAdminDropdownOpen = false;
  }  /**
   * Méthode pour retourner à l'interface client depuis l'admin
   * en déconnectant l'utilisateur
   */
  returnToClientSite(): void {
    // Déconnexion de l'utilisateur
    this.authService.logout();
    
    // Délai court pour s'assurer que la déconnexion est traitée
    setTimeout(() => {
      // Redirection vers la page d'accueil
      window.location.href = '/';
    }, 100);
  }
}