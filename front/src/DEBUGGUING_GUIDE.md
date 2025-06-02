# Guide de débogage - Application Angular

Ce document contient les instructions pour déboguer et résoudre les problèmes courants de l'application.

## 1. Problèmes d'authentification (erreurs 401)

Les erreurs 401 (Non autorisé) se produisent lorsque vous essayez d'accéder à une ressource protégée sans les autorisations nécessaires.

### Solution :

1. **Vérifier le token d'authentification** :
   - Ouvrez la console du navigateur (F12)
   - Exécutez `localStorage.getItem('authToken')` pour voir si un token est présent
   - Si le token est absent, vous devez vous connecter à nouveau

2. **Vérifier si le token est valide** :
   - Rendez-vous à l'URL `/debug` pour accéder à l'outil de débogage
   - Vérifiez la section "État de l'authentification"
   - Si le token est expiré, reconnectez-vous

3. **Tester un endpoint API** :
   - Utilisez l'outil de débogage pour tester un endpoint spécifique
   - Ex : `users/me` pour vérifier votre profil utilisateur

4. **Pour les administrateurs** :
   - Les routes de création/modification des services et formations nécessitent le rôle admin
   - Vérifiez votre rôle utilisateur dans l'outil de débogage

## 2. Problèmes d'URL API (erreurs 404)

Les erreurs 404 (Non trouvé) se produisent lorsque l'URL d'API est incorrecte.

### Solution :

1. Vérifiez que votre API backend fonctionne sur le port 5000
2. Assurez-vous que l'URL de base API est bien configurée dans `environment.ts`
3. Vérifiez qu'il n'y a pas de double préfixe `/api` dans les appels

## 3. Script de débogage rapide

Nous avons inclus un script de débogage rapide qui peut être exécuté depuis la console du navigateur :

```javascript
const script = document.createElement('script');
script.src = '/assets/auth-debug.js';
document.head.appendChild(script);
```

## 4. Solutions aux erreurs courantes

### Problème de double API

Si vous voyez des URLs comme `http://localhost:5000/api/api/users/me`, c'est qu'il y a un problème de double préfixe. La solution est de corriger les services Angular pour qu'ils n'ajoutent pas un deuxième `/api`.

### Problème d'authentification pour les services

Pour créer ou modifier des services, vous devez :
1. Être connecté
2. Avoir le rôle admin
3. Avoir un token valide (non expiré)

Si vous n'êtes pas admin, vous ne pourrez pas créer/modifier de services ou formations.
