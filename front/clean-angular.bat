@echo off
echo ==== Script de nettoyage et optimisation d'Angular ====
echo Ce script va nettoyer votre projet Angular et corriger certains problèmes courants.

rem 1. Supprimer les fichiers de builds
echo 1. Suppression des fichiers de build...
if exist dist\ rmdir /s /q dist\
if exist .angular\cache\ rmdir /s /q .angular\cache\

rem 2. Nettoyer node_modules
echo 2. Nettoyage de node_modules...
if exist node_modules\ rmdir /s /q node_modules\

rem 3. Réinstaller les dépendances
echo 3. Réinstallation des dépendances...
call npm install --force

rem 4. Exécuter un lint pour trouver les problèmes
echo 5. Exécution du linter...
call npx ng lint --fix || echo Pas de configuration de lint trouvée, ignorée.

rem 6. Optionnel : Vérifier les types TypeScript
echo 6. Vérification des types TypeScript...
call npx tsc --noEmit

echo Nettoyage terminé ! Vous pouvez maintenant démarrer votre application avec 'ng serve'
