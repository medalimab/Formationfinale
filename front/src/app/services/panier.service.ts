import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { Formation } from '../models/formation.model';
import { environment } from '../../environments/environment';
import { Panier, PanierItem } from '../models/panier.model';
import { StorageService } from './storage.service';
import { AuthFixService } from './auth-fix.service';

@Injectable({
  providedIn: 'root'
})
export class PanierService {
  private apiUrl = `${environment.apiUrl}/panier`;
  private panierItemsSubject = new BehaviorSubject<PanierItem[]>([]);
  public panierItems$ = this.panierItemsSubject.asObservable();
    constructor(private http: HttpClient, private storageService: StorageService, private authFixService: AuthFixService) {
    this.syncPanierFromServer();
  }
  /**
   * Récupère l'ID de l'utilisateur connecté (depuis le storage)
   */
  private getUserId(): string | null {
    return this.storageService.getItem('userId') || this.storageService.getItem('user_id') || null;
  }

  /**
   * Récupère le panier stocké localement pour l'utilisateur connecté
   */
  private getPanierFromStorage(): PanierItem[] {
    const userId = this.getUserId();
    if (!userId) return [];
    const key = `panier_${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Sauvegarde le panier localement pour l'utilisateur connecté
   */
  private savePanierToStorage(items: PanierItem[]): void {
    const userId = this.getUserId();
    if (!userId) return;
    const key = `panier_${userId}`;
    localStorage.setItem(key, JSON.stringify(items));
  }
  /**
   * À appeler après connexion pour synchroniser le panier local avec le serveur
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

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = this.storageService.getItem('authToken');
    return { headers: new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {}) };
  }

  /**
   * Ajoute une formation au panier (uniquement côté serveur)
   */
  addToPanier(formation: Formation): Observable<any> {
    return this.http.post<{ success: boolean, data: Panier }>(
      this.apiUrl,
      { formationId: formation._id },
      this.getAuthHeaders()
    );
  }

  /**
   * Supprime une formation du panier (uniquement côté serveur)
   */
  removeFromPanier(formationId: string): Observable<any> {
    return this.http.delete<{ success: boolean, data: Panier }>(`${this.apiUrl}/${formationId}`, this.getAuthHeaders());
  }

  /**
   * Récupère le panier depuis le serveur (toujours à jour)
   */
  getPanierFromServer(): Observable<Panier> {
    return this.http.get<{ success: boolean, data: Panier }>(`${this.apiUrl}`, this.getAuthHeaders()).pipe(
      map(response => response.data)
    );
  }

  /**
   * Récupère tous les paniers (admin)
   */
  getAllPaniers() {
    return this.http.get<{ success: boolean, data: Panier[] }>(`${this.apiUrl}/all`, this.getAuthHeaders()).pipe(
      map(response => response.data)
    );
  }

  /**
   * Supprimer un panier (admin)
   */
  deletePanierAdmin(panierId: string): Observable<any> {
    return this.http.delete<{ success: boolean, data: any }>(`${this.apiUrl}/admin/${panierId}`, this.getAuthHeaders());
  }

  /**
   * Mettre à jour un panier (admin)
   */
  updatePanierAdmin(panierId: string, data: Partial<Panier>): Observable<any> {
    return this.http.put<{ success: boolean, data: Panier }>(`${this.apiUrl}/admin/${panierId}`, data, this.getAuthHeaders());
  }
}
