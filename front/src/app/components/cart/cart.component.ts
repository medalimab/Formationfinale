import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalAmount: number = 0;

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.loadCart();
    
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.calculateTotal();
    });
  }

  loadCart(): void {
    this.cartItems = this.cartService.getCartItems();
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.totalAmount = this.cartService.getCartTotal();
  }

  updateQuantity(articleId: string, quantity: number): void {
    this.cartService.updateQuantity(articleId, quantity);
  }

  removeFromCart(articleId: string): void {
    const item = this.cartItems.find(item => item.article._id === articleId);
    if (item) {
      Swal.fire({
        title: 'Êtes-vous sûr ?',
        text: `Voulez-vous supprimer "${item.article.titre}" du panier ?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.isConfirmed) {
          this.cartService.removeFromCart(articleId);
          Swal.fire({
            title: 'Supprimé !',
            text: 'La formation a été retirée de votre liste.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        }
      });
    } else {
      this.cartService.removeFromCart(articleId);
    }
  }

  clearCart(): void {
    if (this.cartItems.length === 0) return;
    
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Voulez-vous vous désinscrire de toutes vos formations ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, tout supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cartService.clearCart();
        Swal.fire({
          title: 'Liste vidée !',
          text: 'Vous avez été désinscrit de toutes les formations.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  }

  checkout(): void {
    // Logique pour finaliser l'achat
    // Pour l'instant, on va simplement vider le panier avec un message
    Swal.fire({
      title: 'Succès !',
      text: 'Commande passée avec succès !',
      icon: 'success',
      confirmButtonColor: '#4361ee',
      confirmButtonText: 'OK'
    });
    this.clearCart();
  }
}
