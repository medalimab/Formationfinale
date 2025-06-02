// Utilitaire de vérification JWT pour le débogage
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JwtDebugService {

  constructor() { }

  /**
   * Vérifie si un token JWT est présent dans le localStorage
   */  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  checkJwtExists(): boolean {
    if (!this.isBrowser()) return false;
    const token = localStorage?.getItem('authToken');
    return !!token;
  }

  /**
   * Décode et vérifie la validité d'un token JWT sans vérifier la signature
   * @returns Informations sur le token
   */  decodeJwt() {
    // Vérifier si l'accès au localStorage est possible (navigateur uniquement)
    if (!this.isBrowser()) {
      return {
        valid: false,
        error: 'Exécution côté serveur - localStorage non disponible',
        expired: null,
        data: null,
        expiresAt: null
      };
    }
    
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return {
        valid: false,
        error: 'Token manquant',
        expired: null,
        data: null,
        expiresAt: null
      };
    }
    
    // Log pour débogage
    console.log('Décodage JWT - Token présent de longueur:', token.length);

    try {
      // Diviser le token et décoder la partie payload (index 1)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return {
          valid: false,
          error: 'Format de token invalide',
          expired: null,
          data: null,
          expiresAt: null
        };
      }      // Vérifier le format du token
      if (!this.isValidTokenFormat(token)) {
        return {
          valid: false,
          error: 'Format de token invalide',
          expired: null,
          data: null,
          expiresAt: null
        };
      }
      
      // Décoder le payload
      const payload = this.parseJwtPayload(parts[1]);
      if (!payload || !payload.id) {
        return {
          valid: false,
          error: 'Payload du token invalide',
          expired: null,
          data: null,
          expiresAt: null
        };
      }
      
      const now = Math.floor(Date.now() / 1000); // Temps actuel en secondes
      const isExpired = payload.exp ? now >= payload.exp : false;
      
      return {
        valid: true,
        expired: isExpired,
        data: payload,
        error: null,
        expiresAt: payload.exp ? new Date(payload.exp * 1000) : null,
        expiresIn: payload.exp ? this.getExpiryTimeRemaining(payload.exp) : null
      };    } catch (error) {
      // Gérer le message d'erreur de manière sécurisée pour TypeScript
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erreur inconnue';
      
      return {
        valid: false,
        error: 'Erreur lors du décodage: ' + errorMessage,
        expired: null,
        data: null,
        expiresAt: null
      };
    }
  }
  /**
   * Vérifie la validité syntaxique du token sans vérifier la signature
   * @returns Vrai si le token est syntaxiquement valide
   */
  isValidTokenFormat(token: string): boolean {
    if (!token) return false;
    
    // Format attendu: xxxx.yyyy.zzzz
    const tokenRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    return tokenRegex.test(token);
  }

  /**
   * Parse le payload JWT (base64 url encoded)
   */
  private parseJwtPayload(base64Payload: string): any {
    // Remplacer les caractères de base64url par des caractères de base64 standard
    const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    
    // Padding
    const paddedBase64 = base64 + '==='.slice(0, (4 - base64.length % 4) % 4);
    
    // Décoder
    const jsonPayload = decodeURIComponent(
      atob(paddedBase64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  }
  
  /**
   * Détermine le temps restant avant expiration
   */
  private getExpiryTimeRemaining(expiryTime: number): string {
    const now = Math.floor(Date.now() / 1000);
    const secondsRemaining = expiryTime - now;
    
    if (secondsRemaining <= 0) {
      return 'Expiré';
    }
    
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;
    
    if (minutes > 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m ${seconds}s`;
    }
    
    return `${minutes}m ${seconds}s`;
  }

  /**
   * Vérifie et affiche le statut d'authentification
   */
  logAuthenticationStatus(): void {
    console.group('État authentification');
    
    const tokenStatus = this.decodeJwt();
    
    if (!tokenStatus.valid) {
      console.log('%c❌ Pas de token valide!', 'color: red; font-weight: bold');
      console.log('Erreur:', tokenStatus.error);
      console.groupEnd();
      return;
    }
    
    if (tokenStatus.expired) {
      console.log('%c⏰ Token expiré!', 'color: orange; font-weight: bold');
      console.log('Expiré le:', tokenStatus.expiresAt);
    } else {
      console.log('%c✅ Token valide!', 'color: green; font-weight: bold');
      console.log('Expire dans:', tokenStatus.expiresIn);
      console.log('Expire le:', tokenStatus.expiresAt);
    }
    
    console.log('Données du token:', tokenStatus.data);
    console.log('ID utilisateur:', tokenStatus.data?.id);
    console.log('Rôle utilisateur:', tokenStatus.data?.role);
    console.groupEnd();
  }

  /**
   * Génère un rapport complet d'authentification
   */
  generateAuthReport(): string {
    const tokenStatus = this.decodeJwt();
    let report = '--- RAPPORT D\'AUTHENTIFICATION ---\n\n';
    
    if (!tokenStatus.valid) {
      report += '❌ PAS DE TOKEN VALIDE\n';
      report += `Erreur: ${tokenStatus.error}\n`;
      return report;
    }
    
    if (tokenStatus.expired) {
      report += '⏰ TOKEN EXPIRÉ\n';
      report += `Expiré le: ${tokenStatus.expiresAt}\n`;
    } else {
      report += '✅ TOKEN VALIDE\n';
      report += `Expire dans: ${tokenStatus.expiresIn}\n`;
      report += `Expire le: ${tokenStatus.expiresAt}\n`;
    }
    
    report += '\nINFORMATIONS UTILISATEUR:\n';
    report += `ID: ${tokenStatus.data?.id || 'Non disponible'}\n`;
    report += `Rôle: ${tokenStatus.data?.role || 'Non disponible'}\n`;
    report += `Email: ${tokenStatus.data?.email || 'Non disponible'}\n`;
    
    report += '\nDÉTAILS TECHNIQUES:\n';
    report += `iat: ${tokenStatus.data?.iat ? new Date(tokenStatus.data.iat * 1000).toISOString() : 'Non disponible'}\n`;
    report += `exp: ${tokenStatus.data?.exp ? new Date(tokenStatus.data.exp * 1000).toISOString() : 'Non disponible'}\n`;
    
    return report;
  }
}
