import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

import { PanierService } from '../../services/panier.service';
import { Panier, PanierItem } from '../../models/panier.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: PanierItem[] = [];
  totalAmount: number = 0;

  constructor(private panierService: PanierService) { }

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.panierService.getPanierFromServer().subscribe({
      next: (panier) => {
        this.cartItems = panier?.formations?.map(item => ({
          formation: item.formation,
          quantity: 1
        })) || [];
        this.calculateTotal();
      },
      error: () => {
        this.cartItems = [];
        this.totalAmount = 0;
      }
    });
  }

  calculateTotal(): void {
    this.totalAmount = this.cartItems.reduce((total, item) => total + (item.formation.prix * item.quantity), 0);
  }

  updateQuantity(formationId: string, quantity: number): void {
    // Optionnel : à implémenter côté backend si gestion de quantité
  }

  removeFromCart(formationId: string): void {
    this.panierService.removeFromPanier(formationId).subscribe({
      next: () => this.loadCart()
    });
  }

  clearCart(): void {
    // Optionnel : à implémenter côté backend si besoin
    this.cartItems.forEach(item => {
      this.removeFromCart(item.formation._id!);
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
