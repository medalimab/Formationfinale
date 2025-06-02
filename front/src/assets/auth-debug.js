// Script de vérification d'authentification
// Ajoutez ce script à votre application puis exécutez-le dans la console du navigateur

function verifierAuthentification() {
  // Récupérer le token JWT
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    console.log('%cPas de token d\'authentification trouvé!', 'color: red; font-weight: bold');
    return;
  }
  
  console.log('%cToken JWT trouvé!', 'color: green; font-weight: bold');
  
  // Tenter de décoder le token (sans vérifier la signature)
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('%cFormat de token invalide', 'color: red');
      return;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    console.log('%cInformations du token:', 'font-weight: bold');
    console.log('ID utilisateur:', payload.id);
    console.log('Rôle:', payload.role);
    
    // Vérifier si le token est expiré
    const expirationDate = new Date(payload.exp * 1000);
    const now = new Date();
    
    if (now > expirationDate) {
      console.log('%cToken EXPIRÉ!', 'color: red; font-weight: bold');
      console.log('Expiré le:', expirationDate);
    } else {
      console.log('%cToken valide', 'color: green; font-weight: bold');
      console.log('Expire le:', expirationDate);
      const minutesRemaining = Math.round((expirationDate - now) / 60000);
      console.log(`Expire dans environ ${minutesRemaining} minute(s)`);
    }
    
    // Vérifier l'autorisation admin
    if (payload.role === 'admin') {
      console.log('%cL\'utilisateur a les droits d\'administrateur', 'color: blue; font-weight: bold');
    } else {
      console.log('%cL\'utilisateur n\'a PAS les droits d\'administrateur', 'color: orange');
    }
    
  } catch (e) {
    console.log('%cErreur lors du décodage du token:', 'color: red');
    console.error(e);
  }
  
  // Tester une requête API simple
  console.log('%cTest d\'une requête API...', 'font-style: italic');
  fetch('/api/services', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    if (response.ok) {
      console.log('%cRequête API réussie!', 'color: green');
    } else {
      console.log(`%cLa requête API a échoué avec le statut ${response.status}`, 'color: red');
    }
    return response.json().catch(() => null);
  })
  .then(data => {
    if (data) {
      console.log('Données reçues:', data);
    }
  })
  .catch(err => {
    console.log('%cErreur lors de la requête API:', 'color: red');
    console.error(err);
  });
}

// Exécutez cette fonction
verifierAuthentification();
