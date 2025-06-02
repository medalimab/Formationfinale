// Outil de diagnostic pour les problèmes d'authentification
// À exécuter dans la console du navigateur

(function() {
  console.group('=== DIAGNOSTIC AUTHENTIFICATION ===');
  
  // 1. Vérifier si le token existe
  const token = localStorage.getItem('authToken');
  console.log('1. Token présent:', !!token);
  
  // 2. Vérifier le format du token
  if (token) {
    const parts = token.split('.');
    const isValidFormat = parts.length === 3;
    console.log('2. Format du token valide:', isValidFormat);
    
    // 3. Décoder le payload
    if (isValidFormat) {
      try {
        const payload = JSON.parse(atob(parts[1]));
        console.log('3. Contenu du token:', payload);
        
        // 4. Vérifier l'expiration
        const now = Math.floor(Date.now() / 1000);
        console.log('4. Token expiré:', payload.exp ? now >= payload.exp : 'Pas de date d\'expiration');
        if (payload.exp) {
          const expireDate = new Date(payload.exp * 1000);
          console.log('   Date d\'expiration:', expireDate.toLocaleString());
          console.log('   Temps restant:', Math.floor((payload.exp - now) / 60), 'minutes');
        }
        
        // 5. Vérifier les rôles
        console.log('5. Rôle utilisateur:', payload.role || 'Non défini dans le token');
        
      } catch (e) {
        console.error('Erreur lors du décodage du token:', e);
      }
    }
  }
  
  // 6. Vérifier les autres valeurs stockées
  console.log('6. Rôle dans localStorage:', localStorage.getItem('userRole'));
  console.log('   Email dans localStorage:', localStorage.getItem('userEmail'));
  
  // 7. Conseils
  console.log('7. Actions possibles:');
  console.log('   - Si le token est absent ou expiré, déconnectez-vous et reconnectez-vous');
  console.log('   - Si le token est présent et valide mais vous avez des erreurs 401, vérifiez le backend');
  console.log('   - Pour réinitialiser votre session, exécutez: localStorage.clear()');
  
  console.groupEnd();
})();
