import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Formation } from '../models/formation.model';
import { environment } from '../../environments/environment';
import { Panier, PanierItem } from '../models/panier.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class PanierService {
  private apiUrl = `${environment.apiUrl}/panier`;
  private panierItemsSubject = new BehaviorSubject<PanierItem[]>(this.getPanierFromStorage());
  public panierItems$ = this.panierItemsSubject.asObservable();
    constructor(private http: HttpClient, private storageService: StorageService) {
    this.syncPanierFromServer();
  }
  /**
   * Récupère le panier stocké localement
   */  private getPanierFromStorage(): PanierItem[] {
    const panierItems = this.storageService.getItem('panierItems');
    return panierItems ? JSON.parse(panierItems) : [];
  }

  /**
   * Sauvegarde le panier localement
   */
  private savePanierToStorage(items: PanierItem[]): void {
    this.storageService.setItem('panierItems', JSON.stringify(items));
    this.panierItemsSubject.next(items);
  }
  /**
   * Synchronise le panier local avec le serveur
   */
  syncPanierFromServer(): void {
    this.http.get<{ success: boolean, data: Panier }>(`${this.apiUrl}`).pipe(
      map(response => {
        if (response.success && response.data) {
          // Convertir le format du backend au format local
          return response.data.formations.map((item: any) => ({
            formation: item.formation as Formation,
            quantity: 1 // Le backend ne gère pas de quantité, donc 1 par défaut
          }));
        }
        return [];
      })
    ).subscribe({
      next: (items) => this.savePanierToStorage(items),
      error: () => {} // Échec silencieux en cas d'erreur (utilisateur non connecté par exemple)
    });
  }

  /**
   * Ajoute une formation au panier (local et serveur)
   */
  addToPanier(formation: Formation): Observable<any> {
    return this.http.post<{ success: boolean, data: Panier }>(
      this.apiUrl, 
      { formationId: formation._id }
    ).pipe(
      tap(() => {
        // Mise à jour locale après succès du serveur
        const currentItems = this.getPanierFromStorage();
        const existingItem = currentItems.find(item => item.formation._id === formation._id);
        
        if (!existingItem) {
          currentItems.push({ formation, quantity: 1 });
          this.savePanierToStorage(currentItems);
        }
      })
    );
  }

  /**
   * Supprime une formation du panier (local et serveur)
   */
  removeFromPanier(formationId: string): Observable<any> {
    return this.http.delete<{ success: boolean, data: Panier }>(`${this.apiUrl}/${formationId}`).pipe(
      tap(() => {
        // Mise à jour locale après succès du serveur
        const currentItems = this.getPanierFromStorage().filter(
          item => item.formation._id !== formationId
        );
        this.savePanierToStorage(currentItems);
      })
    );
  }
  /**
   * Met à jour la quantité d'une formation dans le panier (local uniquement)
   */
  updateQuantity(formationId: string, quantity: number): void {
    if (quantity <= 0) {
      // On utilise la version locale pour éviter l'appel API redondant
      const currentItems = this.getPanierFromStorage().filter(
        item => item.formation._id !== formationId
      );
      this.savePanierToStorage(currentItems);
      return;
    }

    const currentItems = this.getPanierFromStorage();
    const existingItem = currentItems.find(item => item.formation._id === formationId);

    if (existingItem) {
      existingItem.quantity = quantity;
      this.savePanierToStorage(currentItems);
    }
  }

  /**
   * Vide le panier (local uniquement)
   * Note: Le backend ne propose pas actuellement cette fonctionnalité
   */
  clearPanier(): void {
    this.savePanierToStorage([]);
  }

  /**
   * Récupère les éléments du panier
   */
  getPanierItems(): PanierItem[] {
    return this.getPanierFromStorage();
  }

  /**
   * Calcule le montant total du panier
   */
  getPanierTotal(): number {
    const items = this.getPanierFromStorage();
    return items.reduce((total, item) => total + (item.formation.prix * item.quantity), 0);
  }

  /**
   * Compte le nombre d'articles dans le panier
   */
  getPanierCount(): number {
    const items = this.getPanierFromStorage();
    return items.reduce((count, item) => count + item.quantity, 0);
  }
  
  /**
   * Récupère le panier depuis le serveur
   */
  getPanierFromServer(): Observable<Panier> {
    return this.http.get<{ success: boolean, data: Panier }>(`${this.apiUrl}`).pipe(
      map(response => response.data)
    );
  }
}
