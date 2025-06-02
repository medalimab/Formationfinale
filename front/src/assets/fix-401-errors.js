// SCRIPT DE CORRECTION DES ERREURS 401 - À copier/coller dans la console du navigateur

console.group('⚠️ Outil de réparation des erreurs 401 (Unauthorized)');

// 1. Vérifier le token actuel
const token = localStorage.getItem('authToken');
console.log('1. Token JWT trouvé:', !!token);

function decodeToken(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Erreur décodage:', e);
    return null;
  }
}

// 2. Analyser les erreurs potentielles
let problem = null;
let solution = null;

if (!token) {
  problem = "Pas de token d'authentification trouvé";
  solution = "Vous devez vous connecter"; 
  console.log('Solution: Redirection vers la page de connexion...');
  
  // Stocker la page actuelle pour y revenir après la connexion
  localStorage.setItem('returnUrl', window.location.pathname);
  
  if (confirm('Vous devez vous connecter pour continuer. Voulez-vous aller à la page de connexion?')) {
    window.location.href = '/auth/login';
  }
} else {
  // Vérifier si le token est décodable
  const payload = decodeToken(token);
  
  if (!payload) {
    problem = "Token JWT invalide (format incorrect)";
    solution = "Nettoyer le localStorage et se reconnecter";
    
    console.log('Solution: Nettoyage du localStorage...');
    localStorage.clear();
    
    if (confirm('Votre token est invalide. Voulez-vous aller à la page de connexion?')) {
      window.location.href = '/auth/login';
    }
  } else {
    // Vérifier si le token est expiré
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now >= payload.exp) {
      problem = "Token JWT expiré";
      solution = "Se reconnecter pour obtenir un nouveau token";
      
      const expDate = new Date(payload.exp * 1000);
      console.log('Token expiré le:', expDate.toLocaleString());
      console.log('Solution: Suppression du token expiré...');
      
      localStorage.removeItem('authToken');
      
      if (confirm('Votre session a expiré. Voulez-vous vous reconnecter?')) {
        window.location.href = '/auth/login';
      }
    } else {
      // Le token semble valide, peut-être un problème côté serveur?
      problem = "Problème côté serveur ou rôle incorrect";
      solution = "Vérifier les permissions ou le serveur backend";
      
      console.log('Le token semble valide. Détails:');
      console.log('- ID utilisateur:', payload.id);
      console.log('- Rôle:', payload.role);
      console.log('- Expiration:', new Date(payload.exp * 1000).toLocaleString());
      
      if (confirm('Le problème semble venir du serveur ou de vos permissions. Voulez-vous aller à la page de débogage?')) {
        window.location.href = '/debug';
      }
    }
  }
}

// 3. Afficher résumé
console.log('⚠️ Problème détecté:', problem);
console.log('✅ Solution recommandée:', solution);
console.groupEnd();
