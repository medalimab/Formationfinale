# Guide de Dépannage des Erreurs 401 Unauthorized

## Introduction

Ce guide vous aidera à résoudre les problèmes d'authentification (erreurs 401 Unauthorized) dans l'application.

## Étapes de diagnostic

1. **Vérifier l'état d'authentification actuel**
   - Accédez à `/auth-check` pour voir l'état de votre token
   - Vérifiez si votre token est expiré
   - Testez le rafraîchissement du token

2. **Vérifier les logs du navigateur**
   - Ouvrez la console de développement (F12)
   - Recherchez les entrées liées à l'authentification
   - Vérifiez les erreurs HTTP 401 et leurs détails

3. **Problèmes courants et solutions**

   | Problème | Solution |
   |---------|---------|
   | Token expiré | Utiliser la fonctionnalité de rafraîchissement automatique ou se reconnecter |
   | Token mal formaté | Se déconnecter et se reconnecter |
   | Token manquant dans le header | Vérifier que l'intercepteur fonctionne correctement |
   | Problèmes côté serveur | Consulter les logs du serveur pour plus de détails |

## Correction des erreurs spécifiques

### Erreur lors de la création de formations/services

Si vous rencontrez une erreur 401 lors de la création de formations ou services:

1. Assurez-vous d'être connecté avec un compte ayant les droits appropriés (admin ou formateur)
2. Vérifiez que votre token est valide via `/auth-check`
3. Si le token semble valide mais que vous avez des erreurs:
   - Essayez de vous déconnecter puis reconnecter
   - Vérifiez que tous les champs obligatoires sont fournis

### Erreur sur la page de profil

Si votre page de profil affiche des erreurs:

1. Vérifiez que vous êtes correctement authentifié
2. Rafraîchissez votre token si nécessaire
3. Si l'erreur persiste, essayez de vous déconnecter et vous reconnecter

## Utilisation de l'outil de diagnostic d'authentification

Un outil de diagnostic est disponible à l'adresse `/auth-check`. Il vous permet de:

- Voir l'état actuel de votre token
- Forcer le rafraîchissement du token
- Voir les informations détaillées sur votre authentification

## Liens utiles pour le débogage

- Page de connexion: `/auth/login`
- Outil de diagnostic: `/auth-check` 
- API de débogage: `/api/debug/token` et `/api/debug/auth`

## Contact pour assistance

Si vous ne parvenez pas à résoudre votre problème après avoir suivi ces étapes, veuillez contacter l'administrateur système.
