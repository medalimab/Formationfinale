#!/bin/bash

echo "==== Script de nettoyage et optimisation d'Angular ===="
echo "Ce script va nettoyer votre projet Angular et corriger certains problèmes courants."

# 1. Supprimer les fichiers de builds
echo "1. Suppression des fichiers de build..."
rm -rf dist/
rm -rf .angular/cache/

# 2. Nettoyer node_modules
echo "2. Nettoyage de node_modules..."
rm -rf node_modules/

# 3. Réinstaller les dépendances
echo "3. Réinstallation des dépendances..."
npm install --force

# 4. Mettre à jour les packages si nécessaire (optionnel)
# echo "4. Mise à jour des packages (sauf Angular)..."
# npm update --legacy-peer-deps 

# 5. Exécuter un lint pour trouver les problèmes
echo "5. Exécution du linter..."
npx ng lint --fix || echo "Pas de configuration de lint trouvée, ignorée."

# 6. Optionnel : Vérifier les types TypeScript
echo "6. Vérification des types TypeScript..."
npx tsc --noEmit

echo "Nettoyage terminé ! Vous pouvez maintenant démarrer votre application avec 'ng serve'"
