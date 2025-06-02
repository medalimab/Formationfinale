// Ce fichier contient des instructions de débogage pour résoudre les problèmes d'authentification

# GUIDE DE DÉPANNAGE AUTHENTIFICATION

## Problèmes courants et solutions

### 1. Erreurs 401 (Non autorisé)

Si vous rencontrez des erreurs 401, vérifiez:

- **Le token JWT est-il présent?** 
  - Ouvrez la console du navigateur et exécutez:
    ```javascript
    console.log('Token présent:', !!localStorage.getItem('authToken'))
    ```

- **Le token est-il valide?**
  - Accédez à la page `/debug` pour afficher l'état du token
  - Ou utilisez la console du navigateur:
    ```javascript
    const token = localStorage.getItem('authToken');
    const parts = token.split('.');
    console.log(JSON.parse(atob(parts[1])));
    ```

- **Le token est-il expiré?**
  - Vérifiez la propriété `exp` du token (timestamp UNIX)
  - Comparez-la avec le temps actuel:
    ```javascript
    const now = Math.floor(Date.now() / 1000);
    const exp = JSON.parse(atob(token.split('.')[1])).exp;
    console.log('Token expiré:', now >= exp);
    ```

### 2. Problèmes d'ajout/modification des services ou formations

- Vérifiez que les requêtes incluent bien l'en-tête `Authorization`
- Assurez-vous que FormData est correctement formaté
- Vérifiez que votre rôle utilisateur a les permissions nécessaires

### 3. Problèmes de rafraîchissement de token

Si le rafraîchissement de token ne fonctionne pas:
- Vérifiez que la route `/auth/refresh-token` est bien configurée côté backend
- Vérifiez que l'intercepteur appelle correctement cette route

## Comment utiliser le débogueur intégré

1. Accédez à la page `/debug` pour voir l'état de votre token et de l'authentification
2. Cliquez sur "Tester Token" pour vérifier sa validité
3. Utilisez "Analyser Problèmes" pour diagnostiquer les erreurs courantes

## Actions de dépannage

Si les problèmes persistent:

1. Déconnectez-vous et reconnectez-vous
2. Effacez le localStorage:
   ```javascript
   localStorage.clear();
   ```
3. Si rien ne fonctionne, redémarrez le serveur backend et frontend
