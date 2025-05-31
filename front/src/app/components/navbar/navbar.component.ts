
import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
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
  
  private authSubscription: Subscription | null = null;
  private cartSubscription: Subscription | null = null;

  constructor(
    public authService: AuthService, 
    private cartService: CartService
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
    
    // S'abonner aux changements du panier
    this.cartSubscription = this.cartService.cartItems$.subscribe(() => {
      this.updateCartCount();
    });
  }
  
  ngOnDestroy(): void {
    // Se désabonner pour éviter les fuites de mémoire
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  private updateCartCount(): void {
    this.cartCount = this.cartService.getCartCount();
  }

  logout(): void {
    this.authService.logout();
  }
}