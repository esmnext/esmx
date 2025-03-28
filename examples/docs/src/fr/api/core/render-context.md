---
titleSuffix: Référence de l'API du contexte de rendu du framework Esmx
description: Documentation détaillée de la classe principale RenderContext du framework Esmx, incluant le contrôle du rendu, la gestion des ressources, la synchronisation des états et le contrôle du routage, pour aider les développeurs à implémenter un rendu côté serveur efficace.
head:
  - - meta
    - property: keywords
      content: Esmx, RenderContext, SSR, rendu côté serveur, contexte de rendu, synchronisation des états, gestion des ressources, framework d'application Web
---

# RenderContext

RenderContext est la classe principale du framework Esmx, responsable de la gestion du cycle de vie complet du rendu côté serveur (SSR). Elle fournit une API complète pour gérer le contexte de rendu, la gestion des ressources, la synchronisation des états, et d'autres tâches clés :

- **Contrôle du rendu** : Gère le processus de rendu côté serveur, prenant en charge des scénarios comme le rendu multi-entrées et le rendu conditionnel.
- **Gestion des ressources** : Collecte et injecte intelligemment les ressources statiques comme JS, CSS, etc., pour optimiser les performances de chargement.
- **Synchronisation des états** : Gère la sérialisation des états côté serveur, assurant une activation correcte côté client (hydration).
- **Contrôle du routage** : Prend en charge des fonctionnalités avancées comme les redirections côté serveur et la configuration des codes d'état.

## Définitions de types

### ServerRenderHandle

Définition du type de la fonction de traitement du rendu côté serveur.

```ts
type ServerRenderHandle = (rc: RenderContext) => Promise<void> | void;
```

La fonction de traitement du rendu côté serveur est une fonction asynchrone ou synchrone qui prend une instance de RenderContext comme paramètre, utilisée pour gérer la logique de rendu côté serveur.

```ts title="entry.node.ts"
// 1. Fonction asynchrone
export default async (rc: RenderContext) => {
  const app = createApp();
  const html = await renderToString(app);
  rc.html = html;
};

// 2. Fonction synchrone
export const simple = (rc: RenderContext) => {
  rc.html = '<h1>Hello World</h1>';
};
```

### RenderFiles

Définition du type de la liste des fichiers de ressources collectés pendant le processus de rendu.

```ts
interface RenderFiles {
  js: string[];
  css: string[];
  modulepreload: string[];
  resources: string[];
}
```

- **js**: Liste des fichiers JavaScript
- **css**: Liste des fichiers de feuilles de style
- **modulepreload**: Liste des modules ESM à précharger
- **resources**: Liste des autres fichiers de ressources (images, polices, etc.)

```ts
// Exemple de liste de fichiers de ressources
rc.files = {
  js: [
    '/assets/entry-client.js',
    '/assets/vendor.js'
  ],
  css: [
    '/assets/main.css',
    '/assets/vendor.css'
  ],
  modulepreload: [
    '/assets/Home.js',
    '/assets/About.js'
  ],
  resources: [
    '/assets/logo.png',
    '/assets/font.woff2'
  ]
};
```

### ImportmapMode

Définition du mode de génération de l'importmap.

```ts
type ImportmapMode = 'inline' | 'js';
```

- `inline`: Intègre directement le contenu de l'importmap dans le HTML, adapté aux scénarios suivants :
  - Réduction du nombre de requêtes HTTP
  - Contenu de l'importmap de petite taille
  - Exigences élevées en matière de performances de chargement initial
- `js`: Génère le contenu de l'importmap en tant que fichier JS séparé, adapté aux scénarios suivants :
  - Contenu de l'importmap volumineux
  - Nécessité d'utiliser le mécanisme de cache du navigateur
  - Partage du même importmap entre plusieurs pages

Classe de contexte de rendu, responsable de la gestion des ressources et de la génération de HTML pendant le processus de rendu côté serveur (SSR).
## Options d'instance

Définition des options de configuration du contexte de rendu.

```ts
interface RenderContextOptions {
  base?: string
  entryName?: string
  params?: Record<string, any>
  importmapMode?: ImportmapMode
}
```

#### base

- **Type**: `string`
- **Valeur par défaut**: `''`

Chemin de base des ressources statiques.
- Toutes les ressources statiques (JS, CSS, images, etc.) seront chargées en fonction de ce chemin
- Prend en charge la configuration dynamique au moment de l'exécution, sans nécessiter de reconstruction
- Souvent utilisé dans des scénarios comme les sites multilingues ou les applications micro-frontend

#### entryName

- **Type**: `string`
- **Valeur par défaut**: `'default'`

Nom de la fonction d'entrée pour le rendu côté serveur. Utilisé pour spécifier la fonction d'entrée à utiliser lors du rendu côté serveur, lorsqu'un module exporte plusieurs fonctions de rendu.

```ts title="src/entry.server.ts"
export const mobile = async (rc: RenderContext) => {
  // Logique de rendu pour mobile
};

export const desktop = async (rc: RenderContext) => {
  // Logique de rendu pour desktop
};
```

#### params

- **Type**: `Record<string, any>`
- **Valeur par défaut**: `{}`

Paramètres de rendu. Permet de passer des paramètres de tout type à la fonction de rendu, souvent utilisé pour transmettre des informations de requête (URL, paramètres de requête, etc.).

```ts
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'zh-CN',
    theme: 'dark'
  }
});
```

#### importmapMode

- **Type**: `'inline' | 'js'`
- **Valeur par défaut**: `'inline'`

Mode de génération de l'import map :
- `inline`: Intègre directement le contenu de l'importmap dans le HTML
- `js`: Génère le contenu de l'importmap en tant que fichier JS séparé


## Propriétés d'instance

### esmx

- **Type**: `Esmx`
- **Lecture seule**: `true`

Référence à l'instance Esmx. Utilisée pour accéder aux fonctionnalités et configurations principales du framework.

### redirect

- **Type**: `string | null`
- **Valeur par défaut**: `null`

Adresse de redirection. Une fois définie, le serveur peut effectuer une redirection HTTP en fonction de cette valeur, souvent utilisée dans des scénarios comme la vérification de connexion ou le contrôle des permissions.

```ts title="entry.node.ts"
// Exemple de vérification de connexion
export default async (rc: RenderContext) => {
  if (!isLoggedIn()) {
    rc.redirect = '/login';
    rc.status = 302;
    return;
  }
  // Continuer le rendu de la page...
};

// Exemple de contrôle des permissions
export default async (rc: RenderContext) => {
  if (!hasPermission()) {
    rc.redirect = '/403';
    rc.status = 403;
    return;
  }
  // Continuer le rendu de la page...
};
```

### status

- **Type**: `number | null`
- **Valeur par défaut**: `null`

Code d'état HTTP de la réponse. Peut être défini à n'importe quel code d'état HTTP valide, souvent utilisé dans des scénarios de gestion d'erreurs ou de redirection.

```ts title="entry.node.ts"
// Exemple de gestion d'erreur 404
export default async (rc: RenderContext) => {
  const page = await findPage(rc.params.url);
  if (!page) {
    rc.status = 404;
    // Rendu de la page 404...
    return;
  }
  // Continuer le rendu de la page...
};

// Exemple de redirection temporaire
export default async (rc: RenderContext) => {
  if (needMaintenance()) {
    rc.redirect = '/maintenance';
    rc.status = 307; // Redirection temporaire, conserve la méthode de requête
    return;
  }
  // Continuer le rendu de la page...
};
```

### html

- **Type**: `string`
- **Valeur par défaut**: `''`

Contenu HTML. Utilisé pour définir et obtenir le contenu HTML final généré, en traitant automatiquement les espaces réservés pour le chemin de base lors de la définition.

```ts title="entry.node.ts"
// Utilisation de base
export default async (rc: RenderContext) => {
  // Définir le contenu HTML
  rc.html = `
    <!DOCTYPE html>
    <html>
      <head>
        ${rc.preload()}
        ${rc.css()}
      </head>
      <body>
        <div id="app">Hello World</div>
        ${rc.importmap()}
        ${rc.moduleEntry()}
        ${rc.modulePreload()}
      </body>
    </html>
  `;
};

// Chemin de base dynamique
const rc = await esmx.render({
  base: '/app',  // Définir le chemin de base
  params: { url: req.url }
});

// Les espaces réservés dans le HTML seront automatiquement remplacés :
// [[[___GEZ_DYNAMIC_BASE___]]]/your-app-name/css/style.css
// Remplacé par :
// /app/your-app-name/css/style.css
```

### base

- **Type**: `string`
- **Lecture seule**: `true`
- **Valeur par défaut**: `''`

Chemin de base des ressources statiques. Toutes les ressources statiques (JS, CSS, images, etc.) seront chargées en fonction de ce chemin, prenant en charge la configuration dynamique au moment de l'exécution.

```ts
// Utilisation de base
const rc = await esmx.render({
  base: '/esmx',  // Définir le chemin de base
  params: { url: req.url }
});

// Exemple de site multilingue
const rc = await esmx.render({
  base: '/cn',  // Site en chinois
  params: { lang: 'zh-CN' }
});

// Exemple d'application micro-frontend
const rc = await esmx.render({
  base: '/app1',  // Sous-application 1
  params: { appId: 1 }
});
```

### entryName

- **Type**: `string`
- **Lecture seule**: `true`
- **Valeur par défaut**: `'default'`

Nom de la fonction d'entrée pour le rendu côté serveur. Utilisé pour sélectionner la fonction de rendu à utiliser dans entry.server.ts.

```ts title="entry.node.ts"
// Fonction d'entrée par défaut
export default async (rc: RenderContext) => {
  // Logique de rendu par défaut
};

// Plusieurs fonctions d'entrée
export const mobile = async (rc: RenderContext) => {
  // Logique de rendu pour mobile
};

export const desktop = async (rc: RenderContext) => {
  // Logique de rendu pour desktop
};

// Sélection de la fonction d'entrée en fonction du type d'appareil
const rc = await esmx.render({
  entryName: isMobile ? 'mobile' : 'desktop',
  params: { url: req.url }
});
```

### params

- **Type**: `Record<string, any>`
- **Lecture seule**: `true`
- **Valeur par défaut**: `{}`

Paramètres de rendu. Permet de passer et d'accéder aux paramètres pendant le processus de rendu côté serveur, souvent utilisé pour transmettre des informations de requête ou des configurations de page.

```ts
// Utilisation de base - Transmettre l'URL et les paramètres de langue
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'zh-CN'
  }
});

// Configuration de page - Définir le thème et la mise en page
const rc = await esmx.render({
  params: {
    theme: 'dark',
    layout: 'sidebar'
  }
});

// Configuration d'environnement - Injecter l'URL de base de l'API
const rc = await esmx.render({
  params: {
    apiBaseUrl: process.env.API_BASE_URL,
    version: '1.0.0'
  }
});
```

### importMetaSet

- **Type**: `Set<ImportMeta>`

Ensemble de collecte des dépendances de modules. Pendant le rendu des composants, les dépendances de modules sont automatiquement suivies et enregistrées, ne collectant que les ressources réellement utilisées pendant le rendu de la page actuelle.

```ts
// Utilisation de base
const renderToString = (app: any, context: { importMetaSet: Set<ImportMeta> }) => {
  // Collecte automatique des dépendances de modules pendant le rendu
  // Le framework appelle automatiquement context.importMetaSet.add(import.meta) pendant le rendu des composants
  // Les développeurs n'ont pas besoin de gérer manuellement la collecte des dépendances
  return '<div id="app">Hello World</div>';
};

// Exemple d'utilisation
const app = createApp();
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});
```

### files

- **Type**: `RenderFiles`

Liste des fichiers de ressources :
- js: Liste des fichiers JavaScript
- css: Liste des fichiers de feuilles de style
- modulepreload: Liste des modules ESM à précharger
- resources: Liste des autres fichiers de ressources (images, polices, etc.)

```ts
// Collecte des ressources
await rc.commit();

// Injection des ressources
rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    <!-- Préchargement des ressources -->
    ${rc.preload()}
    <!-- Injection des feuilles de style -->
    ${rc.css()}
  </head>
  <body>
    ${html}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
  </body>
  </html>
`;
```

### importmapMode

- **Type**: `'inline' | 'js'`
- **Valeur par défaut**: `'inline'`

Mode de génération de l'import map :
- `inline`: Intègre directement le contenu de l'importmap dans le HTML
- `js`: Génère le contenu de l'importmap en tant que fichier JS séparé


## Méthodes d'instance

### serialize()

- **Paramètres**: 
  - `input: any` - Données à sérialiser
  - `options?: serialize.SerializeJSOptions` - Options de sérialisation
- **Valeur de retour**: `string`

Sérialise un objet JavaScript en chaîne de caractères. Utilisé pour sérialiser les données d'état pendant le processus de rendu côté serveur, assurant que les données peuvent être intégrées en toute sécurité dans le HTML.

```ts
const state = {
  user: { id: 1, name: 'Alice' },
  timestamp: new Date()
};

rc.html = `
  <script>
    window.__INITIAL_STATE__ = ${rc.serialize(state)};
  </script>
`;
```

### state()

- **Paramètres**: 
  - `varName: string` - Nom de la variable
  - `data: Record<string, any>` - Données d'état
- **Valeur de retour**: `string`

Sérialise et injecte les données d'état dans le HTML. Utilise une méthode de sérialisation sûre pour traiter les données, prenant en charge des structures de données complexes.

```ts
const userInfo = {
  id: 1,
  name: 'John',
  roles: ['admin']
};

rc.html = `
  <head>
    ${rc.state('__USER__', userInfo)}
  </head>
`;
```

### commit()

- **Valeur de retour**: `Promise<void>`

Soumet la collecte des dépendances et met à jour la liste des ressources. Collecte tous les modules utilisés à partir de importMetaSet, et analyse les ressources spécifiques de chaque module en fonction du fichier manifest.

```ts
// Rendu et soumission des dépendances
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});

// Soumission de la collecte des dépendances
await rc.commit();
```

### preload()

- **Valeur de retour**: `string`

Génère les balises de préchargement des ressources. Utilisé pour précharger les ressources CSS et JavaScript, prenant en charge la configuration des priorités et le traitement automatique du chemin de base.

```ts
rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    ${rc.preload()}
    ${rc.css()}  <!-- Injection des feuilles de style -->
  </head>
  <body>
    ${html}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
  </body>
  </html>
`;
```

### css()

- **Valeur de retour**: `string`

Génère les balises des feuilles de style CSS. Injecte les fichiers CSS collectés, assurant leur chargement dans le bon ordre.

```ts
rc.html = `
  <head>
    ${rc.css()}  <!-- Injection de toutes les feuilles de style collectées -->
  </head>
`;
```

### importmap()

- **Valeur de retour**: `string`

Génère les balises de l'import map. Génère l'import map en ligne ou externe en fonction de la configuration importmapMode.

```ts
rc.html = `
  <head>
    ${rc.importmap()}  <!-- Injection de l'import map -->
  </head>
`;
```

### moduleEntry()

- **Valeur de retour