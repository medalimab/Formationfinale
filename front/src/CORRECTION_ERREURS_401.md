# Résolution des erreurs 401 (Unauthorized) dans l'application

Ce document explique les modifications apportées pour résoudre les erreurs 401 (Non autorisé) qui se produisaient dans l'application.

## Problèmes identifiés et solutions

### 1. Configuration hybride d'Angular créant une confusion

**Problème :** L'application utilise un mélange d'approche standalone (app.config.ts) et approche par modules (app.module.ts), ce qui causait un conflit dans l'enregistrement de l'intercepteur d'authentification.

**Solution :**
- Réactivé l'intercepteur dans `app.module.ts` pour s'assurer que les composants non-standalone l'utilisent également
- Ajout de logs détaillés dans l'intercepteur pour tracer les problèmes

### 2. Token non envoyé ou non reconnu

**Problème :** Dans certains cas, le token n'était pas correctement envoyé avec les requêtes API.

**Solution :**
- Amélioration de l'intercepteur d'authentification avec une meilleure validation du token
- Ajout de logs pour tracer le processus d'authentification
- Meilleure gestion des cas où le token est expiré ou invalide

### 3. Middleware d'authentification backend trop restrictif

**Problème :** Le middleware d'authentification backend ne fournissait pas assez d'informations sur la nature de l'erreur.

**Solution :**
- Amélioration des messages d'erreur pour distinguer les différents cas (token manquant, token expiré, etc.)
- Ajout de logs côté serveur pour faciliter le débogage

### 4. Outil de diagnostic

Un outil de diagnostic amélioré a été créé pour aider à identifier et résoudre les problèmes d'authentification :
- Accessible via la route `/debug`
- Permet de tester les endpoints API directement
- Affiche l'état actuel du token et les informations d'authentification

## Comment utiliser ces corrections

### En cas d'erreur 401

1. Ouvrez la console du navigateur
2. Copiez-collez le contenu de `assets/fix-401-errors.js` dans la console
3. Suivez les instructions

### Pour vérifier l'état de l'authentification

1. Accédez à la route `/debug` dans l'application
2. Utilisez les différents outils pour vérifier l'état de votre token et tester les API

### Si les problèmes persistent

1. Déconnectez-vous et reconnectez-vous pour obtenir un nouveau token
2. Si le problème persiste, essayez de vider le localStorage (bouton dans la page de débogage)
3. Si nécessaire, redémarrez le serveur backend

## À noter

- Les tokens JWT ont une durée de vie limitée (30 jours par défaut)
- Certaines actions nécessitent des rôles spécifiques (admin, formateur)
- Le refreshToken a été implémenté mais nécessite un redémarrage du serveur pour être pleinement fonctionnel
