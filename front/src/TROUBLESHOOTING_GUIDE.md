# Guide de résolution des problèmes Angular

## Problèmes d'exportation et d'importation

Si vous rencontrez des erreurs comme:
- `File 'XXX' is not a module.`
- `Unexpected "export"`
- `Import "XXX" will always be undefined`

### Solution:
1. Assurez-vous qu'il n'y a qu'un seul mot-clé `export` avant une classe ou une interface
2. Vérifiez que vous n'avez pas ajouté de mot-clé `export` orphelin
3. Vérifiez que le fichier contient bien une exportation

## Problèmes de compilation avec apostrophes françaises

Les apostrophes françaises (`'`) causent des erreurs de syntaxe en TypeScript.

### Solution:
1. Utilisez des apostrophes droites (`'`) ou des guillemets droits (`"`)
2. Dans les templates HTML, utilisez l'entité HTML `&apos;` ou des guillemets doubles
3. Recherchez et remplacez toutes les apostrophes françaises dans le code

## Erreurs 401 (Non autorisé)

### Solution:
1. Vérifiez que vous êtes bien connecté en utilisant l'outil de débogage `/debug`
2. Vérifiez que votre token d'authentification est valide et non expiré
3. Pour les opérations admin, vérifiez que votre utilisateur a le rôle `admin`
4. Utilisez le script `/assets/auth-debug.js` pour diagnostiquer les problèmes d'authentification

## Problèmes généraux de compilation

Si vous avez des problèmes persistants de compilation:

### Solution:
1. Exécutez le script `clean-angular.bat` (Windows) ou `clean-angular.sh` (Linux/Mac)
2. Ce script nettoiera les caches et les fichiers de build, réinstallera les dépendances et recherchera les erreurs de typage
3. Après son exécution, redémarrez votre serveur de développement avec `ng serve`

## Issues avec les intercepteurs HTTP

Si les intercepteurs ne fonctionnent pas correctement:

### Solution:
1. Assurez-vous que vous n'ajoutez pas les intercepteurs à la fois dans `app.module.ts` et `app.config.ts`
2. Angular 17 utilise généralement `app.config.ts` pour configurer les intercepteurs
3. Vérifiez que les intercepteurs sont correctement exportés et injectable (`@Injectable()`)

## Problèmes avec les composants autonomes (standalone)

### Solution:
1. Les composants autonomes doivent avoir `standalone: true` dans leur décorateur `@Component`
2. Ils ne doivent pas être déclarés dans le tableau `declarations` d'un module Angular
3. Ils doivent importer tous les modules dont ils ont besoin via leur propriété `imports`
