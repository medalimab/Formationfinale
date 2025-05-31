
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
  private cartItemsSubject = new BehaviorSubject<CartItem[]>(this.getCartFromStorage());
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private storageService: StorageService) {}
  private getCartFromStorage(): CartItem[] {
    const cartItems = this.storageService.getItem('cartItems');
    return cartItems ? JSON.parse(cartItems) : [];
  }
  private saveCartToStorage(items: CartItem[]): void {
    this.storageService.setItem('cartItems', JSON.stringify(items));
    this.cartItemsSubject.next(items);
  }
  addToCart(article: Formation, quantity: number = 1): void {
    const currentItems = this.getCartFromStorage();
    const existingItem = currentItems.find(item => item.article._id === article._id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      currentItems.push({ article, quantity });
    }

    this.saveCartToStorage(currentItems);
  }

  removeFromCart(articleId: string): void {
    const currentItems = this.getCartFromStorage().filter(
      item => item.article._id !== articleId
    );
    this.saveCartToStorage(currentItems);
  }

  updateQuantity(articleId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(articleId);
      return;
    }

    const currentItems = this.getCartFromStorage();
    const itemIndex = currentItems.findIndex(item => item.article._id === articleId);
    
    if (itemIndex !== -1) {
      currentItems[itemIndex].quantity = quantity;
      this.saveCartToStorage(currentItems);
    }
  }

  getCartItems(): CartItem[] {
    return this.getCartFromStorage();
  }

  getCartTotal(): number {
    
    return this.getCartFromStorage().reduce(
      (count, item) => count + item.quantity, 
      0
    );
  }

  getCartCount(): number {
    return this.getCartFromStorage().reduce(
      (count, item) => count + item.quantity, 
      0
    );
  }

  clearCart(): void {
    this.saveCartToStorage([]);
  }
}
