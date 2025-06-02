// patchAuth.js - Script à exécuter dans la console du navigateur pour corriger les problèmes d'authentification
(function() {
  // Fonctions utilitaires
  function decodeJwt(token) {
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      return JSON.parse(atob(parts[1]));
    } catch (e) {
      console.error('Erreur de décodage du token:', e);
      return null;
    }
  }
  
  function checkTokenValidity() {
    const token = localStorage.getItem('authToken');
    if (!token) return { valid: false, reason: 'absent' };
    
    const payload = decodeJwt(token);
    if (!payload) return { valid: false, reason: 'format-invalide' };
    
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now >= payload.exp) {
      return { valid: false, reason: 'expire', expireDate: new Date(payload.exp * 1000) };
    }
    
    return { valid: true, payload };
  }
  
  // Vérifier l'état actuel
  const tokenStatus = checkTokenValidity();
  console.log('Statut token:', tokenStatus);
  
  // Si le token est invalide, on nettoie et on redirige vers la connexion
  if (!tokenStatus.valid) {
    console.warn(`Token ${tokenStatus.reason}. Nettoyage et redirection...`);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    
    // Stocker l'URL actuelle pour y revenir après la connexion
    const currentPath = window.location.pathname;
    if (currentPath !== '/auth/login' && currentPath !== '/auth/register') {
      localStorage.setItem('returnUrl', currentPath);
    }
    
    // Rediriger vers la page de connexion
    if (confirm('Votre session a expiré ou est invalide. Voulez-vous vous reconnecter?')) {
      window.location.href = '/auth/login';
    }
  } else {
    console.log('Token valide. Informations utilisateur:', tokenStatus.payload);
    alert('Votre authentification est valide!');
  }
})();
