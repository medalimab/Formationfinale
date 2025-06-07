import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Formation } from '../models/formation.model';
import { StorageService } from './storage.service';

export interface CartItem {
  article: Formation;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Ce service n'utilise plus le localStorage. Toutes les opérations doivent passer par PanierService (backend).
  constructor() {}

  // Méthodes désactivées
  addToCart(): void {
    throw new Error('addToCart n\'est plus supporté. Utilisez PanierService pour toute opération panier.');
  }
  removeFromCart(): void {
    throw new Error('removeFromCart n\'est plus supporté. Utilisez PanierService pour toute opération panier.');
  }
  updateQuantity(): void {
    throw new Error('updateQuantity n\'est plus supporté. Utilisez PanierService pour toute opération panier.');
  }
  getCartItems(): never[] {
    return [];
  }
  getCartTotal(): number {
    return 0;
  }
  getCartCount(): number {
    return 0;
  }
  clearCart(): void {
    // Ne fait rien
  }
}
