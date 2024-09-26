const fs = require('fs') // Ajoutez cette ligne pour importer le module fs
const path = require('path')

const readmePath = path.join(__dirname, 'README.md')

// Liste des bibliothèques JavaScript avec descriptions
const libraries = [
    {
        name: 'Axios',
        description: 'Une bibliothèque pour faire des requêtes HTTP.',
        link: 'https://axios-http.com/'
    },
    {
        name: 'Lodash',
        description:
            'Une bibliothèque utilitaire qui fournit des fonctions pour des tâches courantes.',
        link: 'https://lodash.com/'
    },
    {
        name: 'Moment.js',
        description: 'Une bibliothèque pour manipuler et afficher les dates et heures.',
        link: 'https://momentjs.com/'
    },
    {
        name: 'jQuery',
        description:
            'Une bibliothèque pour simplifier la manipulation du DOM et les requêtes AJAX.',
        link: 'https://jquery.com/'
    },
    {
        name: 'Underscore',
        description:
            'Une bibliothèque utilitaire qui fournit des fonctions de programmation fonctionnelle.',
        link: 'https://underscorejs.org/'
    },
    {
        name: 'D3.js',
        description: 'Une bibliothèque pour créer des graphiques dynamiques et interactifs.',
        link: 'https://d3js.org/'
    },
    {
        name: 'Chart.js',
        description: 'Une bibliothèque pour créer des graphiques animés et interactifs.',
        link: 'https://www.chartjs.org/'
    },
    {
        name: 'Three.js',
        description: 'Une bibliothèque pour créer des graphiques 3D sur le web.',
        link: 'https://threejs.org/'
    },
    {
        name: 'PixiJS',
        description: 'Une bibliothèque pour créer des graphiques 2D haute performance.',
        link: 'https://pixijs.com/'
    },
    {
        name: 'Redux',
        description: "Une bibliothèque pour gérer l'état de l'application JavaScript.",
        link: 'https://redux.js.org/'
    },
    {
        name: 'RxJS',
        description: 'Une bibliothèque pour la programmation réactive utilisant des observables.',
        link: 'https://rxjs.dev/'
    },
    {
        name: 'Vue.js',
        description:
            'Un framework pour construire des interfaces utilisateur et des applications monopages.',
        link: 'https://vuejs.org/'
    },
    {
        name: 'React',
        description: 'Une bibliothèque pour construire des interfaces utilisateur interactives.',
        link: 'https://reactjs.org/'
    },
    {
        name: 'Angular',
        description: 'Un framework pour construire des applications web dynamiques.',
        link: 'https://angular.io/'
    },
    {
        name: 'Ember.js',
        description: 'Un framework pour créer des applications web ambitieuses.',
        link: 'https://emberjs.com/'
    },
    {
        name: 'Backbone.js',
        description: 'Une bibliothèque pour structurer les applications JavaScript en modèles MVC.',
        link: 'https://backbonejs.org/'
    },
    {
        name: 'Svelte',
        description:
            'Un framework pour construire des interfaces utilisateur réactives sans le coût de la bibliothèque virtuelle DOM.',
        link: 'https://svelte.dev/'
    },
    {
        name: 'Preact',
        description: 'Une alternative rapide et légère à React.',
        link: 'https://preactjs.com/'
    },
    {
        name: 'Express',
        description: 'Un framework minimaliste pour construire des applications web en Node.js.',
        link: 'https://expressjs.com/'
    },
    {
        name: 'Koa',
        description:
            'Un framework web pour Node.js conçu pour être un moteur de middleware plus moderne.',
        link: 'https://koajs.com/'
    },
    {
        name: 'NestJS',
        description:
            'Un framework pour construire des applications server-side en utilisant TypeScript.',
        link: 'https://nestjs.com/'
    },
    {
        name: 'Fastify',
        description: 'Un framework web rapide et performant pour Node.js.',
        link: 'https://www.fastify.io/'
    },
    {
        name: 'Next.js',
        description:
            'Un framework pour React qui permet le rendu côté serveur et la génération de sites statiques.',
        link: 'https://nextjs.org/'
    },
    {
        name: 'Gatsby',
        description: 'Un générateur de sites statiques basé sur React.',
        link: 'https://www.gatsbyjs.com/'
    },
    {
        name: 'Nuxt.js',
        description: 'Un framework basé sur Vue.js pour créer des applications universelles.',
        link: 'https://nuxtjs.org/'
    },
    {
        name: 'Meteor',
        description: 'Un framework pour construire des applications web et mobiles en temps réel.',
        link: 'https://www.meteor.com/'
    },
    {
        name: 'Aurelia',
        description: 'Un framework pour créer des applications web modernes et modulaires.',
        link: 'https://aurelia.io/'
    },
    {
        name: 'Webpack',
        description: 'Un module bundler pour JavaScript et les autres ressources web.',
        link: 'https://webpack.js.org/'
    },
    {
        name: 'Parcel',
        description: "Un bundler d'applications web sans configuration.",
        link: 'https://parceljs.org/'
    },
    {
        name: 'Rollup',
        description: 'Un bundler de modules JavaScript pour des projets modernes.',
        link: 'https://rollupjs.org/'
    },
    {
        name: 'Babel',
        description:
            'Un transcompilateur JavaScript pour utiliser les fonctionnalités modernes du langage.',
        link: 'https://babeljs.io/'
    },
    {
        name: 'TypeScript',
        description: 'Un sur-ensemble de JavaScript qui ajoute des types statiques.',
        link: 'https://www.typescriptlang.org/'
    },
    {
        name: 'Jest',
        description: 'Un framework de test JavaScript avec un focus sur la simplicité.',
        link: 'https://jestjs.io/'
    },
    {
        name: 'Mocha',
        description: 'Un framework de test pour JavaScript.',
        link: 'https://mochajs.org/'
    },
    {
        name: 'Chai',
        description: "Une bibliothèque d'assertions pour les tests JavaScript.",
        link: 'https://www.chaijs.com/'
    },
    {
        name: 'Cypress',
        description: 'Un framework de test end-to-end pour les applications web.',
        link: 'https://www.cypress.io/'
    },
    {
        name: 'Jasmine',
        description: 'Un framework de test comportemental pour JavaScript.',
        link: 'https://jasmine.github.io/'
    },
    {
        name: 'Sinon',
        description: 'Une bibliothèque pour les spies, mocks, et stubs dans les tests JavaScript.',
        link: 'https://sinonjs.org/'
    },
    {
        name: 'Storybook',
        description: 'Un outil pour construire et tester des composants UI de manière isolée.',
        link: 'https://storybook.js.org/'
    },
    {
        name: 'TSDoc',
        description: 'Un outil pour documenter les projets TypeScript avec des commentaires JSDoc.',
        link: 'https://tsdoc.org/'
    },
    {
        name: 'Eslint',
        description: 'Un linter JavaScript pour identifier et signaler les problèmes de code.',
        link: 'https://eslint.org/'
    },
    {
        name: 'Prettier',
        description: "Un formateur de code pour JavaScript et d'autres langages.",
        link: 'https://prettier.io/'
    },
    {
        name: 'Husky',
        description: 'Un outil pour exécuter des hooks Git avant les commits et les pushes.',
        link: 'https://typicode.github.io/husky/#/'
    },
    {
        name: 'Lint-staged',
        description: 'Un outil pour exécuter des linters sur les fichiers git staged.',
        link: 'https://github.com/okonet/lint-staged'
    },
    {
        name: 'Puppeteer',
        description: "Une bibliothèque pour contrôler des navigateurs Chromium via l'API DevTools.",
        link: 'https://pptr.dev/'
    },
    {
        name: 'Playwright',
        description:
            'Une bibliothèque pour tester des applications web avec des navigateurs modernes.',
        link: 'https://playwright.dev/'
    },
    {
        name: 'Nightwatch',
        description: 'Un framework de test end-to-end pour les applications web.',
        link: 'https://nightwatchjs.org/'
    },
    {
        name: 'Karma',
        description: 'Un test runner pour les tests unitaires dans les navigateurs.',
        link: 'https://karma-runner.github.io/'
    },
    {
        name: 'Webpack Dev Server',
        description: 'Un serveur de développement pour Webpack avec rechargement à chaud.',
        link: 'https://webpack.js.org/configuration/dev-server/'
    },
    {
        name: 'LiveServer',
        description: 'Un serveur de développement local avec rechargement automatique.',
        link: 'https://www.npmjs.com/package/live-server'
    },
    {
        name: 'Browsersync',
        description: 'Un outil pour synchroniser le développement entre plusieurs navigateurs.',
        link: 'https://browsersync.io/'
    },
    {
        name: 'Webpack Encore',
        description: 'Un wrapper de Webpack pour Symfony.',
        link: 'https://symfony.com/doc/current/frontend/encore/installation.html'
    },
    {
        name: 'Jest-extended',
        description: 'Une extension de Jest avec des assertions supplémentaires.',
        link: 'https://github.com/jest-community/jest-extended'
    },
    {
        name: 'React Router',
        description: 'Une bibliothèque pour la gestion des routes dans une application React.',
        link: 'https://reactrouter.com/'
    },
    {
        name: 'Vue Router',
        description: 'Une bibliothèque pour la gestion des routes dans une application Vue.js.',
        link: 'https://router.vuejs.org/'
    },
    {
        name: 'React Query',
        description:
            'Une bibliothèque pour la gestion des états de données asynchrones dans React.',
        link: 'https://tanstack.com/query/latest'
    },
    {
        name: 'Apollo Client',
        description: 'Une bibliothèque pour interagir avec des API GraphQL.',
        link: 'https://www.apollographql.com/docs/react/'
    },
    {
        name: 'GraphQL',
        description: 'Un langage de requête pour les APIs.',
        link: 'https://graphql.org/'
    },
    {
        name: 'Formik',
        description: 'Une bibliothèque pour gérer les formulaires dans React.',
        link: 'https://formik.org/'
    },
    {
        name: 'Yup',
        description: 'Une bibliothèque pour valider des objets JavaScript.',
        link: 'https://github.com/jquense/yup'
    },
    {
        name: 'Ant Design',
        description: 'Une bibliothèque de composants UI pour React.',
        link: 'https://ant.design/'
    },
    {
        name: 'Material-UI',
        description: 'Une bibliothèque de composants UI pour React avec le design Material.',
        link: 'https://mui.com/'
    },
    {
        name: 'Tailwind CSS',
        description: 'Un framework CSS utilitaire.',
        link: 'https://tailwindcss.com/'
    },
    {
        name: 'Bootstrap',
        description: 'Un framework CSS populaire pour le développement web responsive.',
        link: 'https://getbootstrap.com/'
    },
    {
        name: 'Bulma',
        description: 'Un framework CSS moderne basé sur Flexbox.',
        link: 'https://bulma.io/'
    },
    {
        name: 'Foundation',
        description: 'Un framework CSS responsive pour les applications web.',
        link: 'https://get.foundation/'
    },
    {
        name: 'Sass',
        description: 'Un préprocesseur CSS avec une syntaxe avancée.',
        link: 'https://sass-lang.com/'
    },
    {
        name: 'Less',
        description: 'Un préprocesseur CSS avec des fonctionnalités similaires à Sass.',
        link: 'https://lesscss.org/'
    },
    {
        name: 'Styled-components',
        description: 'Une bibliothèque pour le CSS-in-JS dans React.',
        link: 'https://styled-components.com/'
    },
    {
        name: 'Emotion',
        description: 'Une bibliothèque pour le CSS-in-JS avec des fonctionnalités avancées.',
        link: 'https://emotion.sh/'
    },
    {
        name: 'PostCSS',
        description: 'Un outil pour transformer le CSS avec des plugins JavaScript.',
        link: 'https://postcss.org/'
    },
    {
        name: 'Gulp',
        description: "Un toolkit pour l'automatisation des tâches de développement.",
        link: 'https://gulpjs.com/'
    },
    {
        name: 'Grunt',
        description: 'Un gestionnaire de tâches pour automatiser les processus de développement.',
        link: 'https://gruntjs.com/'
    },
    {
        name: 'Browserify',
        description: 'Un outil pour empaqueter les modules Node.js pour le navigateur.',
        link: 'http://browserify.org/'
    },
    {
        name: 'Nodemon',
        description:
            "Un outil qui surveille les changements dans votre projet Node.js et redémarre automatiquement l'application.",
        link: 'https://nodemon.io/'
    },
    {
        name: 'PM2',
        description: 'Un gestionnaire de processus pour les applications Node.js.',
        link: 'https://pm2.keymetrics.io/'
    },
    {
        name: 'Electron',
        description:
            'Un framework pour créer des applications desktop avec JavaScript, HTML, et CSS.',
        link: 'https://www.electronjs.org/'
    },
    {
        name: 'Capacitor',
        description:
            'Un framework pour créer des applications mobiles multiplateformes avec JavaScript.',
        link: 'https://capacitorjs.com/'
    },
    {
        name: 'Ionic',
        description:
            'Un framework pour construire des applications mobiles et web avec une seule base de code.',
        link: 'https://ionicframework.com/'
    },
    {
        name: 'React Native',
        description: 'Un framework pour construire des applications mobiles natives avec React.',
        link: 'https://reactnative.dev/'
    },
    {
        name: 'NativeScript',
        description:
            'Un framework pour construire des applications mobiles natives avec JavaScript.',
        link: 'https://nativescript.org/'
    },
    {
        name: 'Expo',
        description: 'Un outil pour développer des applications React Native rapidement.',
        link: 'https://expo.dev/'
    },
    {
        name: 'Cordova',
        description:
            'Un framework pour créer des applications mobiles avec HTML, CSS, et JavaScript.',
        link: 'https://cordova.apache.org/'
    },
    {
        name: 'Quasar',
        description:
            'Un framework pour développer des applications Vue.js avec une approche multiplateforme.',
        link: 'https://quasar.dev/'
    },
    {
        name: 'Tauri',
        description:
            'Un framework pour créer des applications desktop légères avec des technologies web.',
        link: 'https://tauri.app/'
    },
    {
        name: 'Sapper',
        description: 'Un framework pour construire des applications web avec Svelte.',
        link: 'https://sapper.svelte.dev/'
    },
    {
        name: 'Nx',
        description: 'Un outil pour la gestion des monorepos JavaScript et TypeScript.',
        link: 'https://nx.dev/'
    },
    {
        name: 'Lerna',
        description: 'Un outil pour gérer les monorepos JavaScript.',
        link: 'https://lerna.js.org/'
    },
    {
        name: 'Yarn',
        description: 'Un gestionnaire de paquets rapide, fiable et sécurisé pour JavaScript.',
        link: 'https://yarnpkg.com/'
    },
    {
        name: 'npm',
        description: 'Le gestionnaire de paquets par défaut pour Node.js.',
        link: 'https://www.npmjs.com/'
    },
    {
        name: 'pnpm',
        description: 'Un gestionnaire de paquets rapide et efficace pour JavaScript.',
        link: 'https://pnpm.io/'
    },
    {
        name: 'Vite',
        description:
            'Un outil de développement front-end rapide avec un hot module replacement performant.',
        link: 'https://vitejs.dev/'
    },
    {
        name: 'Vitest',
        description: 'Un framework de test ultra rapide basé sur Vite.',
        link: 'https://vitest.dev/'
    },
    {
        name: 'Storybook',
        description: 'Un outil pour construire et tester des composants UI de manière isolée.',
        link: 'https://storybook.js.org/'
    },
    {
        name: 'Leaflet',
        description: 'Une bibliothèque pour créer des cartes interactives.',
        link: 'https://leafletjs.com/'
    },
    {
        name: 'Anime.js',
        description: 'Une bibliothèque pour animer des éléments DOM, SVG, et plus.',
        link: 'https://animejs.com/'
    },
    {
        name: 'Framer Motion',
        description: 'Une bibliothèque pour animer les composants React.',
        link: 'https://www.framer.com/motion/'
    },
    {
        name: 'FullCalendar',
        description: 'Une bibliothèque pour créer des calendriers interactifs.',
        link: 'https://fullcalendar.io/'
    },
    {
        name: 'GSAP',
        description: 'Une bibliothèque puissante pour créer des animations.',
        link: 'https://greensock.com/gsap/'
    },
    {
        name: 'Algolia InstantSearch',
        description: 'Une bibliothèque pour implémenter une recherche instantanée.',
        link: 'https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/js/'
    },
    {
        name: 'Immutable.js',
        description: 'Une bibliothèque pour créer des structures de données immuables.',
        link: 'https://immutable-js.github.io/immutable-js/'
    },
    {
        name: 'PicoCSS',
        description: 'Un framework CSS minimaliste pour des interfaces légères et rapides.',
        link: 'https://picocss.com/'
    },
    {
        name: 'Mustache.js',
        description: 'Un moteur de template léger pour JavaScript.',
        link: 'https://github.com/janl/mustache.js'
    },
    {
        name: 'Alpine.js',
        description: 'Un framework léger pour manipuler le DOM directement dans le HTML.',
        link: 'https://alpinejs.dev/'
    },
    {
        name: 'Swiper',
        description: 'Une bibliothèque pour créer des carrousels et sliders responsives.',
        link: 'https://swiperjs.com/'
    },
    {
        name: 'Popper.js',
        description: 'Une bibliothèque pour gérer les popovers, tooltips, et dropdowns.',
        link: 'https://popper.js.org/'
    },
    {
        name: 'Day.js',
        description:
            'Une bibliothèque légère pour manipuler les dates et heures, alternative à Moment.js.',
        link: 'https://day.js.org/'
    },
    {
        name: 'Mithril',
        description:
            'Un framework JavaScript moderne pour construire des applications web rapides.',
        link: 'https://mithril.js.org/'
    },
    {
        name: 'Vivus',
        description: 'Une bibliothèque pour animer des SVG en les dessinant.',
        link: 'https://maxwellito.github.io/vivus/'
    },
    {
        name: 'Bottleneck',
        description: "Une bibliothèque pour limiter le débit d'appels asynchrones.",
        link: 'https://github.com/SGrondin/bottleneck'
    },
    {
        name: 'Cytoscape.js',
        description: 'Une bibliothèque pour visualiser des graphes complexes.',
        link: 'https://js.cytoscape.org/'
    },
    {
        name: 'Chance.js',
        description: 'Une bibliothèque pour générer des données aléatoires.',
        link: 'https://chancejs.com/'
    },
    {
        name: 'Chartist',
        description: 'Une bibliothèque pour créer des graphiques réactifs et simples.',
        link: 'https://gionkunz.github.io/chartist-js/'
    },
    {
        name: 'Shepherd.js',
        description: 'Une bibliothèque pour créer des tours guidés interactifs sur les pages web.',
        link: 'https://shepherdjs.dev/'
    },
    {
        name: 'Ractive.js',
        description: 'Un framework pour construire des interfaces utilisateur interactives.',
        link: 'https://ractive.js.org/'
    },
    {
        name: 'Reveal.js',
        description: 'Une bibliothèque pour créer des présentations web interactives.',
        link: 'https://revealjs.com/'
    },
    {
        name: 'Mark.js',
        description: 'Une bibliothèque pour mettre en surbrillance des mots dans un texte.',
        link: 'https://markjs.io/'
    },
    {
        name: 'Cleave.js',
        description: 'Une bibliothèque pour formater automatiquement les champs de formulaire.',
        link: 'https://nosir.github.io/cleave.js/'
    },
    {
        name: 'Konva',
        description:
            'Une bibliothèque pour manipuler des éléments graphiques sur des canevas HTML5.',
        link: 'https://konvajs.org/'
    },
    {
        name: 'Select2',
        description: 'Une bibliothèque pour améliorer les menus déroulants HTML.',
        link: 'https://select2.org/'
    },
    {
        name: 'Lottie',
        description:
            'Une bibliothèque pour animer les fichiers JSON exportés depuis Adobe After Effects.',
        link: 'https://airbnb.io/lottie/'
    },
    {
        name: 'Tippy.js',
        description: 'Une bibliothèque pour créer des tooltips dynamiques.',
        link: 'https://atomiks.github.io/tippyjs/'
    },
    {
        name: 'Hammer.js',
        description: 'Une bibliothèque pour gérer les événements tactiles et gestuels.',
        link: 'https://hammerjs.github.io/'
    },
    {
        name: 'Barba.js',
        description: 'Une bibliothèque pour créer des transitions fluides entre les pages.',
        link: 'https://barba.js.org/'
    },
    {
        name: 'PhotoSwipe',
        description: "Une bibliothèque pour créer des galeries d'images légères et réactives.",
        link: 'https://photoswipe.com/'
    },
    {
        name: 'Fine Uploader',
        description:
            'Une bibliothèque pour gérer les téléchargements de fichiers avec de nombreuses options.',
        link: 'https://fineuploader.com/'
    },
    {
        name: 'AOS (Animate On Scroll)',
        description: 'Une bibliothèque pour animer les éléments lors du défilement de la page.',
        link: 'https://michalsnik.github.io/aos/'
    },
    {
        name: 'Zdog',
        description:
            'Une bibliothèque pour créer des graphiques 3D simples et animés avec SVG et Canvas.',
        link: 'https://zzz.dog/'
    },
    {
        name: 'Tone.js',
        description: 'Une bibliothèque pour créer de la musique et des sons avec JavaScript.',
        link: 'https://tonejs.github.io/'
    },
    {
        name: 'Wavesurfer.js',
        description:
            'Une bibliothèque pour visualiser et manipuler les fichiers audio avec des vagues.',
        link: 'https://wavesurfer-js.org/'
    },
    {
        name: 'SortableJS',
        description: 'Une bibliothèque pour trier et réorganiser les éléments de liste.',
        link: 'https://sortablejs.github.io/Sortable/'
    },
    {
        name: 'FilePond',
        description:
            'Une bibliothèque pour télécharger des fichiers avec des interfaces modernes et personnalisables.',
        link: 'https://pqina.nl/filepond/'
    },
    {
        name: 'Quill',
        description: 'Un éditeur WYSIWYG moderne pour le Web.',
        link: 'https://quilljs.com/'
    },
    {
        name: 'CodeMirror',
        description: 'Un éditeur de code dans le navigateur avec support pour diverses langages.',
        link: 'https://codemirror.net/'
    },
    {
        name: 'Trix',
        description: 'Un éditeur de texte WYSIWYG pour les applications Web.',
        link: 'https://trix-editor.org/'
    },
    {
        name: 'CamanJS',
        description: "Une bibliothèque de manipulation d'images directement dans le navigateur.",
        link: 'http://camanjs.com/'
    },
    {
        name: 'NgRx',
        description: "Gestion d'état réactive pour Angular",
        link: 'https://ngrx.io/'
    },
    {
        name: 'Angular Material',
        description: 'Composants basés sur Material Design',
        link: 'https://material.angular.io/'
    },
    {
        name: 'PrimeNG',
        description: 'Suite de composants UI',
        link: 'https://www.primefaces.org/primeng/'
    },
    {
        name: 'Nebular',
        description: 'Framework UI basé sur Angular',
        link: 'https://akveo.github.io/nebular/'
    },
    {
        name: 'Angular Fire',
        description: 'Intégration Firebase pour Angular',
        link: 'https://github.com/angular/angularfire'
    },
    {
        name: 'RxJS',
        description: 'Extensions réactives pour JavaScript',
        link: 'https://rxjs.dev/'
    },
    {
        name: 'Apollo Angular',
        description: 'Intégration GraphQL pour Angular',
        link: 'https://apollo-angular.com/'
    },
    {
        name: 'ngx-bootstrap',
        description: 'Composants Bootstrap pour Angular',
        link: 'https://valor-software.com/ngx-bootstrap/'
    },
    {
        name: 'Angular Flex Layout',
        description: 'Système de disposition flexible',
        link: 'https://github.com/angular/flex-layout'
    },
    {
        name: 'Ngx-translate',
        description: 'Internationalisation pour Angular',
        link: 'https://github.com/ngx-translate/core'
    },
    {
        name: 'Clarity',
        description: "Framework UI d'entreprise",
        link: 'https://clarity.design/'
    },
    {
        name: 'Angular Testing Library',
        description: 'Outils de test pour Angular',
        link: 'https://testing-library.com/docs/angular-testing-library/intro/'
    },
    {
        name: 'DevExtreme Angular',
        description: 'Composants et widgets pour Angular',
        link: 'https://js.devexpress.com/Documentation/Guide/Angular_Components/'
    },
    {
        name: 'AG Grid',
        description: 'Composant de grille avancé',
        link: 'https://www.ag-grid.com/angular-data-grid/'
    },
    {
        name: 'Ionic',
        description: 'Framework pour le développement mobile',
        link: 'https://ionicframework.com/'
    },
    {
        name: 'Sapper',
        description: 'Framework de développement web basé sur Svelte',
        link: 'https://sapper.svelte.dev/'
    },
    {
        name: 'SvelteKit',
        description: 'Framework moderne pour les applications Svelte',
        link: 'https://kit.svelte.dev/'
    },
    {
        name: 'svelte-i18n',
        description: 'Internationalisation pour Svelte',
        link: 'https://github.com/kaisermann/svelte-i18n'
    },
    {
        name: 'Svelte Material UI',
        description: 'Composants UI basés sur Material Design',
        link: 'https://sveltematerialui.com/'
    },
    {
        name: 'Svelte Simple Modal',
        description: 'Modales simples et accessibles pour Svelte',
        link: 'https://github.com/kevmodrome/svelte-simple-modal'
    },
    {
        name: 'Routify',
        description: 'Routage dynamique pour Svelte',
        link: 'https://routify.dev/'
    },
    {
        name: 'Svelte Forms',
        description: 'Gestion facile des formulaires',
        link: 'https://github.com/leveluptuts/svelte-forms-lib'
    },
    {
        name: 'Svelte Store',
        description: "Gestion d'état réactive et intégrée",
        link: 'https://svelte.dev/tutorial/writable-stores'
    },
    {
        name: 'Svelte Motion',
        description: 'Gestion des animations',
        link: 'https://github.com/Popmotion/svelte-pose'
    },
    {
        name: 'Svelte Fire',
        description: 'Intégration Firebase',
        link: 'https://svelte-firebase.vercel.app/'
    },
    {
        name: 'Svelte Chart',
        description: 'Graphiques pour Svelte',
        link: 'https://github.com/vitejs/svelte-chart'
    },
    {
        name: 'Svelte Virtual List',
        description: 'Rendu performant de longues listes',
        link: 'https://github.com/sveltejs/svelte-virtual-list'
    },
    {
        name: 'Svelte Heroicons',
        description: 'Icônes Heroicons pour Svelte',
        link: 'https://github.com/Chartbrew/svelte-heroicons'
    },
    {
        name: 'Svelte Notifications',
        description: 'Système de notifications',
        link: 'https://github.com/beyonk-adventures/svelte-notifications'
    },
    {
        name: 'Svelte Preprocess',
        description: 'Préprocesseur CSS et autres pour Svelte',
        link: 'https://github.com/sveltejs/svelte-preprocess'
    },
    {
        name: 'dayjs',
        description: 'Une alternative légère à Moment.js pour la manipulation de dates',
        link: 'https://day.js.org/'
    },
    {
        name: 'Flickity',
        description: 'Une bibliothèque pour créer des carrousels et sliders fluides',
        link: 'https://flickity.metafizzy.co/'
    },
    {
        name: 'Fuse.js',
        description:
            'Bibliothèque de recherche floue pour effectuer des recherches basées sur des algorithmes de similarité',
        link: 'https://fusejs.io/'
    },
    {
        name: 'Cash',
        description: 'Une alternative légère à jQuery',
        link: 'https://github.com/fabiospampinato/cash'
    },
    {
        name: 'Pico.js',
        description: 'Bibliothèque JavaScript pour la détection de visages',
        link: 'https://github.com/tehnokv/picojs'
    },
    {
        name: 'Bottleneck',
        description: "Gestion des taux de requêtes pour limiter les appels d'API",
        link: 'https://www.npmjs.com/package/bottleneck'
    },
    {
        name: 'date-fns',
        description: 'Utilitaires de manipulation de dates fonctionnels et légers',
        link: 'https://date-fns.org/'
    },
    {
        name: 'SortableJS',
        description: 'Bibliothèque pour créer des listes drag-and-drop triables',
        link: 'https://sortablejs.github.io/Sortable/'
    },
    {
        name: 'Nano ID',
        description: "Générateur d'ID unique et sécurisé",
        link: 'https://github.com/ai/nanoid'
    },
    {
        name: 'Micromodal',
        description: 'Bibliothèque légère pour la gestion des modales',
        link: 'https://micromodal.vercel.app/'
    },
    {
        name: 'Vivus',
        description: 'Bibliothèque pour animer des SVG de manière progressive',
        link: 'https://maxwellito.github.io/vivus/'
    },
    {
        name: 'Mustache.js',
        description: 'Moteur de template simple et sans logique',
        link: 'https://github.com/janl/mustache.js/'
    },
    {
        name: 'Rough.js',
        description: 'Générateur de graphiques dessinés à la main pour le web',
        link: 'https://roughjs.com/'
    },
    {
        name: 'Idb-keyval',
        description: 'Promesses simplifiées pour stocker des paires clé-valeur dans IndexedDB',
        link: 'https://github.com/jakearchibald/idb-keyval'
    },
    {
        name: 'Filepond',
        description: 'Bibliothèque pour télécharger et traiter des fichiers de manière fluide',
        link: 'https://pqina.nl/filepond/'
    },
    {
        name: 'Choices.js',
        description: 'Bibliothèque pour créer des listes déroulantes et des champs multi-sélection',
        link: 'https://joshuajohnson.co.uk/Choices/'
    },
    {
        name: 'Cleave.js',
        description: 'Bibliothèque pour formater les champs de formulaire',
        link: 'https://nosir.github.io/cleave.js/'
    },
    {
        name: 'Tippy.js',
        description: 'Bibliothèque de tooltips légers et flexibles',
        link: 'https://atomiks.github.io/tippyjs/'
    },
    {
        name: 'Glide.js',
        description: 'Un carrousel léger et réactif pour le web',
        link: 'https://glidejs.com/'
    },
    {
        name: 'Granim.js',
        description: 'Bibliothèque pour créer des gradients animés',
        link: 'https://sarcadass.github.io/granim.js/'
    },
    {
        name: 'Chance.js',
        description: 'Bibliothèque pour générer des données aléatoires (noms, adresses, etc.)',
        link: 'https://chancejs.com/'
    },
    {
        name: 'Receptor',
        description: "Gestionnaire d'événements de type middleware",
        link: 'https://github.com/adamrenklint/receptor'
    },
    {
        name: 'Lax.js',
        description: 'Bibliothèque pour ajouter des animations de défilement simples',
        link: 'https://alexfoxy.github.io/lax.js/'
    },
    {
        name: 'Mousetrap',
        description: 'Gestion simplifiée des raccourcis clavier',
        link: 'https://craig.is/killing/mice'
    },
    {
        name: 'Voca',
        description: "Bibliothèque pour la manipulation et l'analyse des chaînes de caractères",
        link: 'https://vocajs.com/'
    },
    {
        name: 'Vivus',
        description: 'Bibliothèque pour animer les SVG au trait',
        link: 'https://maxwellito.github.io/vivus/'
    },
    {
        name: 'Tabulator',
        description:
            'Bibliothèque pour créer des tableaux interactifs avec tri, recherche et pagination',
        link: 'http://tabulator.info/'
    },
    {
        name: 'Wavesurfer.js',
        description: "Bibliothèque pour afficher et interagir avec des formes d'onde audio",
        link: 'https://wavesurfer-js.org/'
    },
    {
        name: 'Howler.js',
        description: "Bibliothèque pour gérer l'audio de manière simple et flexible",
        link: 'https://howlerjs.com/'
    },
    {
        name: 'SortableJS',
        description:
            'Bibliothèque pour rendre des listes et des objets triables par glisser-déposer',
        link: 'https://sortablejs.github.io/Sortable/'
    },
    {
        name: 'Day.js',
        description: 'Bibliothèque légère pour la manipulation de dates',
        link: 'https://day.js.org/'
    },
    {
        name: 'Micromodal',
        description: 'Bibliothèque légère pour créer des modales accessibles',
        link: 'https://micromodal.vercel.app/'
    },
    {
        name: 'Tagify',
        description: 'Bibliothèque pour ajouter des balises dans des champs de texte',
        link: 'https://yaireo.github.io/tagify/'
    },
    {
        name: 'Locomotive Scroll',
        description: 'Bibliothèque pour créer des effets de défilement lisses',
        link: 'https://locomotivemtl.github.io/locomotive-scroll/'
    },
    {
        name: 'Blotter.js',
        description: 'Bibliothèque pour créer des effets de texte créatifs',
        link: 'https://blotter.js.org/'
    },
    {
        name: 'Fathom',
        description: "Outil d'analyse de site web léger et respectueux de la vie privée",
        link: 'https://usefathom.com/'
    },
    {
        name: 'Gumshoe',
        description: 'Bibliothèque pour le suivi des défilements et des sections de page',
        link: 'https://github.com/aggro/Gumshoe.js'
    },
    {
        name: 'Lottie',
        description: 'Bibliothèque pour rendre des animations Adobe After Effects',
        link: 'https://airbnb.io/lottie/'
    },
    {
        name: 'Masonry',
        description: 'Bibliothèque pour créer des mises en page en grille dynamique',
        link: 'https://masonry.desandro.com/'
    },
    {
        name: 'Plyr',
        description: 'Lecteur multimédia simple et élégant',
        link: 'https://plyr.io/'
    },
    {
        name: 'Rellax',
        description: 'Bibliothèque de parallaxe légère',
        link: 'https://dixonandmoe.com/rellax/'
    },
    {
        name: 'Microtip',
        description: 'Bibliothèque pour des infobulles légères et flexibles',
        link: 'https://github.com/MatteoGabriele/microtip'
    },
    {
        name: 'Parallax.js',
        description: 'Bibliothèque simple pour des effets de parallaxe',
        link: 'https://matthew.wagerfield.com/parallax/'
    },
    {
        name: 'Cleave.js',
        description:
            'Bibliothèque pour formater des champs de saisie au fur et à mesure de la frappe',
        link: 'https://nosir.github.io/cleave.js/'
    },
    {
        name: 'Just-Validate',
        description: 'Bibliothèque légère pour la validation des formulaires',
        link: 'https://github.com/DevDreams/Just-Validate'
    },
    {
        name: 'Tippy.js',
        description: 'Bibliothèque pour les infobulles et les poppers',
        link: 'https://atomiks.github.io/tippyjs/'
    },
    {
        name: 'Rough.js',
        description: 'Bibliothèque pour dessiner des graphiques et des illustrations à la main',
        link: 'https://roughjs.com/'
    },
    {
        name: 'Blotter.js',
        description: 'Bibliothèque pour des animations de texte créatives',
        link: 'https://blotterjs.com/'
    },
    {
        name: 'Wave.js',
        description: 'Bibliothèque pour créer des animations de vagues',
        link: 'https://github.com/horenku/wave'
    },
    {
        name: 'Anime.js',
        description: "Bibliothèque d'animation légère et flexible",
        link: 'https://animejs.com/'
    },
    {
        name: 'Two.js',
        description: 'Bibliothèque pour créer des graphiques 2D interactifs',
        link: 'https://two.js.org/'
    },
    {
        name: 'Grid.js',
        description: 'Tableau et grille de données personnalisable',
        link: 'https://gridjs.io/'
    },
    {
        name: 'ScrollReveal',
        description: "Animations d'apparition lors du défilement",
        link: 'https://scrollrevealjs.org/'
    },
    {
        name: 'Vega',
        description: 'Outil de visualisation de données basé sur JSON',
        link: 'https://vega.github.io/vega/'
    },
    {
        name: 'AnimeJS',
        description: "Bibliothèque d'animation légère",
        link: 'https://animejs.com/'
    },
    {
        name: 'Tagify',
        description: "Gestion de tags et d'entrées",
        link: 'https://yaireo.github.io/tagify/'
    },
    {
        name: 'Clipboard.js',
        description: 'Gestion du copier-coller',
        link: 'https://clipboardjs.com/'
    },
    {
        name: 'Waves.js',
        description: "Effets d'onde pour des boutons",
        link: 'https://fian.im/Waves/'
    },
    {
        name: 'FullPage.js',
        description: 'Sites web à défilement plein écran',
        link: 'https://alvarotrigo.com/fullPage/'
    },
    {
        name: 'Glide.js',
        description: 'Carrousel responsive',
        link: 'https://glidejs.com/'
    },
    {
        name: 'Isotope',
        description: 'Filtrage et mise en page dynamique',
        link: 'https://isotope.metafizzy.co/'
    },
    {
        name: 'CountUp.js',
        description: 'Animations de compte à rebours',
        link: 'https://inorganik.github.io/countUp.js/'
    },
    {
        name: 'ImageMapster',
        description: 'Rendre les images interactives',
        link: 'http://markmarkoh.com/projects/imagemapster/'
    },
    {
        name: 'Pikaday',
        description: 'Calendrier léger',
        link: 'https://pikaday.com/'
    },
    {
        name: 'Fancybox',
        description: 'Galeries et modales élégantes',
        link: 'https://fancyapps.com/fancybox/3/'
    },
    {
        name: 'Chocolat',
        description: "Affichage d'images dans une boîte modale",
        link: 'https://noelboss.github.io/Chocolat/'
    },
    {
        name: 'react-beautiful-dnd',
        description: 'Drag and drop pour React',
        link: 'https://github.com/atlassian/react-beautiful-dnd'
    },
    {
        name: 'react-dnd',
        description: 'Drag and drop avec React',
        link: 'https://react-dnd.github.io/react-dnd/'
    },
    {
        name: 'SortableJS',
        description: 'Bibliothèque de tri et de glisser-déposer',
        link: 'https://github.com/SortableJS/Sortable'
    },
    {
        name: 'Dragula',
        description: 'Drag and drop sans dépendances',
        link: 'https://github.com/bevacqua/dragula'
    },
    {
        name: 'Interact.js',
        description: 'Manipulation des éléments dans le navigateur',
        link: 'https://interactjs.io/'
    },
    {
        name: 'react-draggable',
        description: 'Facilement déplacer des composants dans React',
        link: 'https://github.com/react-grid-layout/react-draggable'
    },
    {
        name: 'jQuery UI Draggable',
        description: 'Drag and drop avec jQuery UI',
        link: 'https://jqueryui.com/draggable/'
    },
    {
        name: 'dnd-kit',
        description: 'Kit de glisser-déposer pour React',
        link: 'https://dndkit.com/'
    },
    {
        name: 'vue-draggable',
        description: 'Drag and drop pour Vue.js',
        link: 'https://github.com/SortableJS/Vue.Draggable'
    },
    {
        name: 'dragselect',
        description: "Sélection d'éléments avec glisser-déposer",
        link: 'https://github.com/NoahZinsmeister/dragselect'
    },
    {
        name: 'react-dropzone',
        description: 'Zone de dépôt de fichiers pour React',
        link: 'https://react-dropzone.js.org/'
    },
    {
        name: 'gridstack.js',
        description: 'Drag and drop de widgets en grille',
        link: 'https://gridstackjs.com/'
    },
    {
        name: 'HTML5 Sortable',
        description: 'Sortables et drag-and-drop en HTML5',
        link: 'https://github.com/SortableJS/Sortable'
    },
    {
        name: 'ngx-drag-drop',
        description: 'Drag and drop pour Angular',
        link: 'https://github.com/angular-drag-drop/ngx-drag-drop'
    },
    {
        name: 'Vue.Draggable.Next',
        description: 'Drag and drop pour Vue 3',
        link: 'https://github.com/SortableJS/Vue.Draggable.Next'
    },
    {
        name: 'FullCalendar',
        description: 'Calendrier interactif et responsive',
        link: 'https://fullcalendar.io/'
    },
    {
        name: 'Day.js',
        description: 'Library lightweight pour manipuler les dates',
        link: 'https://day.js.org/'
    },
    {
        name: 'date-fns',
        description: 'Outils pour travailler avec les dates',
        link: 'https://date-fns.org/'
    },
    {
        name: 'React Big Calendar',
        description: 'Calendrier pour React avec événements',
        link: 'https://github.com/jquense/react-big-calendar'
    },
    {
        name: 'Vue Cal',
        description: 'Calendrier pour Vue.js',
        link: 'https://github.com/nathanreyes/v-calendar'
    },
    {
        name: 'Angular Calendar',
        description: 'Calendrier pour Angular',
        link: 'https://github.com/mattlewis92/angular-calendar'
    },
    {
        name: 'Tui Calendar',
        description: 'Calendrier flexible et personnalisable',
        link: 'https://github.com/nhn/tui.calendar'
    },
    {
        name: 'Pikaday',
        description: 'Sélecteur de date simple et léger',
        link: 'https://pikaday.com/'
    },
    {
        name: 'Flatpickr',
        description: 'Sélecteur de date et heure',
        link: 'https://flatpickr.js.org/'
    },
    {
        name: 'jsCalendar',
        description: 'Calendrier léger et personnalisable',
        link: 'https://js-calendar.github.io/jsCalendar/'
    },
    {
        name: 'Air Datepicker',
        description: 'Sélecteur de date moderne et léger',
        link: 'https://t1m0n.name/air-datepicker/docs/index.html'
    },
    {
        name: 'Tempus Dominus',
        description: 'Sélecteur de date et heure basé sur Bootstrap',
        link: 'https://tempusdominus.github.io/bootstrap-4/'
    },
    {
        name: 'Date Range Picker',
        description: 'Sélecteur de plage de dates',
        link: 'https://www.daterangepicker.com/'
    },
    {
        name: 'Calendar.js',
        description: 'Générateur de calendriers simples',
        link: 'https://github.com/kciter/calendar.js'
    },
    {
        name: 'vanilla-calendar',
        description: 'Calendrier simple en vanilla JS',
        link: 'https://github.com/bananajoe/vanilla-calendar'
    },
    {
        name: 'particles.js',
        description: 'Effets de particules en arrière-plan',
        link: 'https://github.com/VincentGarreau/particles.js'
    },
    {
        name: 'Three.js',
        description: 'Bibliothèque pour créer des graphiques 3D',
        link: 'https://threejs.org/'
    },
    {
        name: 'PixiJS',
        description: 'Bibliothèque 2D rapide et flexible',
        link: 'https://pixijs.com/'
    },
    {
        name: 'Canvas.js',
        description: 'Facilite la manipulation de canevas',
        link: 'https://canvasjs.com/'
    },
    {
        name: 'Rough.js',
        description: 'Dessin à la main pour des éléments graphiques',
        link: 'https://roughjs.com/'
    },
    {
        name: 'bgfx',
        description: 'Bibliothèque de rendu graphique multiplateforme',
        link: 'https://bkaradzic.github.io/bgfx/bgfx.html'
    },
    {
        name: 'Fabric.js',
        description: "Manipulation d'éléments canvas",
        link: 'http://fabricjs.com/'
    },
    {
        name: 'CamanJS',
        description: "Éditeur d'images en JavaScript",
        link: 'http://camanjs.com/'
    },
    {
        name: 'Noise.js',
        description: 'Générateur de bruit pour les fonds',
        link: 'https://github.com/cyrildiagne/noisejs'
    },
    {
        name: 'Konva',
        description: 'API pour le dessin 2D sur le canvas',
        link: 'https://konvajs.org/'
    },
    {
        name: 'Tsparticles',
        description: 'Effets de particules modernes',
        link: 'https://tsparticles.github.io/'
    },
    {
        name: 'SVG.js',
        description: "Manipulation d'éléments SVG",
        link: 'https://svgjs.dev/'
    },
    {
        name: 'Waves.js',
        description: 'Effets de vagues en arrière-plan',
        link: 'https://haghish.github.io/waves.js/'
    },
    {
        name: 'GroundOverlay',
        description: "Overlay d'images sur les cartes",
        link: 'https://github.com/openlayers/openlayers'
    },
    {
        name: 'Vanta.js',
        description: "Effets d'arrière-plan animés",
        link: 'https://www.vantajs.com/'
    },
    {
        name: 'DOMPurify',
        description: 'Sanitisation des entrées HTML',
        link: 'https://github.com/cure53/DOMPurify'
    },
    {
        name: 'xss',
        description: 'Filtrage des entrées XSS',
        link: 'https://github.com/leizongmin/js-xss'
    },
    {
        name: 'sanitize-html',
        description: 'Sanitisation HTML configurable',
        link: 'https://github.com/apostrophecms/sanitize-html'
    },
    {
        name: 'html-sanitizer',
        description: 'Sanitisation des contenus HTML',
        link: 'https://github.com/google/html-sanitizer'
    },
    {
        name: 'xss-filters',
        description: 'Filtres XSS pour JavaScript',
        link: 'https://github.com/yahoo/xss-filters'
    },
    {
        name: 'xss-clean',
        description: 'Middleware pour nettoyer les entrées',
        link: 'https://github.com/nfriedly/xss-clean'
    },
    {
        name: 'js-xss',
        description: 'Filtrage XSS en JavaScript',
        link: 'https://github.com/leizongmin/js-xss'
    },
    {
        name: 'Sanitize',
        description: 'Bibliothèque de nettoyage de contenu',
        link: 'https://github.com/12rambau/sanitize'
    },
    {
        name: 'bleach',
        description: 'Sanitisation HTML en Python',
        link: 'https://bleach.readthedocs.io/en/latest/'
    },
    {
        name: 'SafeHTML',
        description: 'Sanitisation pour HTML en JavaScript',
        link: 'https://github.com/secure-software-engineering/SafeHTML'
    },
    {
        name: 'html-sanitizer',
        description: 'Sanitisation pour Node.js',
        link: 'https://github.com/adiwajshing/HtmlSanitizer'
    },
    {
        name: 'DOMPurify',
        description: 'Sanitisation pour les applications web',
        link: 'https://github.com/cure53/DOMPurify'
    },
    {
        name: 'secure-html',
        description: 'Sanitisation des contenus HTML',
        link: 'https://github.com/johnriley/secure-html'
    },
    {
        name: 'sanitize.js',
        description: 'Sanitisation légère des contenus',
        link: 'https://github.com/ptb/sanitize'
    },
    {
        name: 'Gatsby-plugin-sanitized-html',
        description: 'Sanitisation dans Gatsby',
        link: 'https://www.gatsbyjs.com/plugins/gatsby-plugin-sanitized-html/'
    },
    {
        name: 'Dropzone.js',
        description: 'Zone de dépôt de fichiers pour les uploads',
        link: 'https://www.dropzonejs.com/'
    },
    {
        name: 'Uppy',
        description: 'Bibliothèque de téléchargement de fichiers moderne',
        link: 'https://uppy.io/'
    },
    {
        name: 'FilePond',
        description: "Bibliothèque d'upload de fichiers",
        link: 'https://pqina.nl/filepond/'
    },
    {
        name: 'Fine Uploader',
        description: 'Bibliothèque de téléchargement de fichiers',
        link: 'https://fineuploader.com/'
    },
    {
        name: 'Plupload',
        description: 'Uploader de fichiers basé sur HTML5',
        link: 'https://www.plupload.com/'
    },
    {
        name: 'jQuery File Upload',
        description: 'Uploader de fichiers avec jQuery',
        link: 'https://blueimp.github.io/jQuery-File-Upload/'
    },
    {
        name: 'React Dropzone',
        description: 'Zone de dépôt pour React',
        link: 'https://react-dropzone.js.org/'
    },
    {
        name: 'Vue FilePond',
        description: 'Uploader de fichiers pour Vue.js',
        link: 'https://pqina.nl/filepond/examples/vue/'
    },
    {
        name: 'Angular File Upload',
        description: 'Uploader de fichiers pour Angular',
        link: 'https://github.com/valor-software/ng2-file-upload'
    },
    {
        name: 'ImageKit.io',
        description: "Gestion et optimisation d'images",
        link: 'https://imagekit.io/'
    },
    {
        name: 'Cloudinary',
        description: "Gestion d'images et de vidéos",
        link: 'https://cloudinary.com/'
    },
    {
        name: 'Filestack',
        description: 'Upload, transformation et gestion des fichiers',
        link: 'https://www.filestack.com/'
    },
    {
        name: 'Tus.io',
        description: 'Protocole pour upload de fichiers',
        link: 'https://tus.io/'
    },
    {
        name: 'Resumable.js',
        description: 'Uploader de fichiers en plusieurs parties',
        link: 'http://www.resumablejs.com/'
    },
    {
        name: 'Image Upload Preview',
        description: "Aperçu de l'image avant upload",
        link: 'https://github.com/abranhe/image-upload-preview'
    }
]

// Définir l'agenda
const agenda = {
    'Semaine 1': {
        '23 septembre - 29 septembre': {
            'Lundi 23 septembre': [
                {
                    time: '9h - 12h30',
                    duration: '3h30',
                    task: 'Développement backend : Implémentation des routes pour la suppression de message (Node.js).'
                },
                {
                    time: '13h30 - 17h',
                    duration: '3h30',
                    task: 'Développement frontend : Interface pour la suppression de message (Svelte).'
                }
            ],
            'Mardi 24 septembre': [
                {
                    time: '9h - 12h30',
                    duration: '3h30',
                    task: 'Développement backend : Routes pour la modification des données utilisateur (Node.js).'
                },
                {
                    time: '13h30 - 17h',
                    duration: '3h30',
                    task: 'Développement frontend : Formulaire de modification des données utilisateur (Svelte).'
                }
            ],
            'Mercredi 25 septembre': [
                {
                    time: '9h - 11h',
                    duration: '2h',
                    task: 'Recherche de stage : Suivi des candidatures et ajustement des documents.'
                },
                {
                    time: '11h - 12h30',
                    duration: '1h30',
                    task: 'Liaison frontend/backend : Connexion des routes API pour suppression et modification (Node.js, Svelte).'
                },
                {
                    time: '13h30 - 17h',
                    duration: '3h30',
                    task: 'Optimisations frontend : Améliorations UI et liaison avec le backend (Svelte).'
                }
            ],
            'Jeudi 26 septembre': [
                {
                    time: '9h - 12h30',
                    duration: '3h30',
                    task: 'Optimisation backend : Amélioration des performances des routes API (Node.js).'
                },
                {
                    time: '13h30 - 17h',
                    duration: '3h30',
                    task: "Améliorations UI frontend : Optimisation de l'interface utilisateur (Svelte)."
                }
            ],
            'Vendredi 27 septembre': [
                {
                    time: '9h - 12h30',
                    duration: '3h30',
                    task: 'Finalisation backend : Ajustements finaux sur les routes API (Node.js).'
                },
                {
                    time: '13h30 - 17h',
                    duration: '3h30',
                    task: "Finalisation frontend : Ajustements d'interface utilisateur et liaison avec le backend (Svelte)."
                }
            ],
            'Samedi 28 septembre': [
                {
                    time: '13h30 - 15h30',
                    duration: '2h',
                    task: 'Corrections mineures backend et frontend (Node.js, Svelte).'
                }
            ],
            'Dimanche 29 septembre': [
                {
                    time: '13h30 - 15h30',
                    duration: '2h',
                    task: 'Veille technologique et réflexion sur les projets futurs.'
                }
            ]
        }
    },
    'Semaine 2': {
        '30 septembre - 6 octobre': {
            'Lundi 30 septembre': [
                {
                    time: '9h - 12h30',
                    duration: '3h30',
                    task: 'Révision de React : Concepts de base et hooks.'
                },
                {
                    time: '13h30 - 17h',
                    duration: '3h30',
                    task: 'Révision de TypeScript : Typage et interfaces.'
                }
            ],
            'Mardi 1 octobre': [
                {
                    time: '9h - 12h30',
                    duration: '3h30',
                    task: "Révision de Redux : Gestion d'état et middleware."
                },
                {
                    time: '13h30 - 17h',
                    duration: '3h30',
                    task: 'Mise en pratique de Redux avec un projet simple.'
                }
            ],
            'Mercredi 2 octobre': [
                {
                    time: '9h - 11h',
                    duration: '2h',
                    task: 'Recherche de stage : Suivi des candidatures et ajustement des documents.'
                },
                {
                    time: '11h - 12h30',
                    duration: '1h30',
                    task: 'Révision de React : Projets et intégration avec TypeScript.'
                },
                {
                    time: '13h30 - 17h',
                    duration: '3h30',
                    task: 'Révision de Redux : Projets avancés et meilleures pratiques.'
                }
            ],
            'Jeudi 3 octobre': [
                {
                    time: '9h - 12h30',
                    duration: '3h30',
                    task: "Pratique de React : Développement d'une petite application."
                },
                {
                    time: '13h30 - 17h',
                    duration: '3h30',
                    task: 'Pratique de TypeScript : Application des concepts dans un projet.'
                }
            ],
            'Vendredi 4 octobre': [
                {
                    time: '9h - 12h30',
                    duration: '3h30',
                    task: "Pratique de Redux : Intégration avec l'application React."
                },
                {
                    time: '13h30 - 17h',
                    duration: '3h30',
                    task: 'Finalisation du projet : Intégration de toutes les compétences.'
                }
            ],
            'Samedi 5 octobre': [
                {
                    time: '13h30 - 15h30',
                    duration: '2h',
                    task: 'Réflexion sur les projets futurs et mise à jour du code existant.'
                }
            ],
            'Dimanche 6 octobre': [
                {
                    time: '13h30 - 15h30',
                    duration: '2h',
                    task: 'Veille technologique et recherche de nouvelles ressources.'
                }
            ]
        }
    }
}

function getRandomLibrary() {
    const randomIndex = Math.floor(Math.random() * libraries.length)
    return libraries[randomIndex]
}

// Fonction pour obtenir la date au format 'Jour Date Mois' (ex: 'mardi 13 août')
function formatDate(date) {
    const months = [
        'janvier',
        'février',
        'mars',
        'avril',
        'mai',
        'juin',
        'juillet',
        'août',
        'septembre',
        'octobre',
        'novembre',
        'décembre'
    ]

    const dayOptions = {weekday: 'long', day: 'numeric'}
    const dayName = date.toLocaleDateString('fr-FR', dayOptions)

    let dayOfWeek = dayName.split(' ')[0] // 'mardi'
    dayOfWeek = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1).toLowerCase() // 'Mardi'

    const dayOfMonth = date.getDate() // 13
    const month = months[date.getMonth()] // 'août'

    return `${dayOfWeek} ${dayOfMonth} ${month}` // 'Mardi 13 août'
}

// Fonction pour générer le contenu de l'agenda pour une date donnée
function generateDayAgenda(day) {
    let agendaContent = ''

    // Parcourir chaque semaine dans l'agenda
    for (const week in agenda) {
        for (const period in agenda[week]) {
            if (agenda[week][period][day]) {
                agendaContent += `<h3>Agenda du ${day}\n 🗓️</h3>`
                agenda[week][period][day].forEach(task => {
                    agendaContent += `<div align="center">${task.time} : ${task.task}\n</div>`
                })
                agendaContent += '\n'
                return agendaContent // Sortir dès qu'on a trouvé la section
            }
        }
    }
    return 'Aucun agenda disponible pour ce jour.'
}

// Fonction pour mettre à jour le README
function updateReadme() {
    if (!fs.existsSync(readmePath)) {
        console.error("Le fichier README.md est introuvable à l'emplacement :", readmePath)
        process.exit(1)
    }

    // Lire le contenu actuel du README
    let content = fs.readFileSync(readmePath, 'utf8')

    // Trouver l'ancien bloc de bibliothèque à remplacer
    const librarySectionPattern =
        /<!-- START_LIBRARY_SECTION -->[\s\S]*?<!-- END_LIBRARY_SECTION -->/
    const newLibrary = getRandomLibrary()
    let newContent = content.replace(librarySectionPattern, match => {
        return `<!-- START_LIBRARY_SECTION -->
 **[${newLibrary.name}](${newLibrary.link})**: ${newLibrary.description}
<!-- END_LIBRARY_SECTION -->`
    })

    // Obtenir la date actuelle et formater
    const currentDay = formatDate(new Date())

    // Ajouter l'agenda pour le jour actuel au README
    const agendaSectionPattern = /<!-- START_AGENDA_SECTION -->[\s\S]*?<!-- END_AGENDA_SECTION -->/
    const newAgendaContent = generateDayAgenda(currentDay)
    newContent = newContent.replace(agendaSectionPattern, match => {
        return `<!-- START_AGENDA_SECTION -->
${newAgendaContent}
<!-- END_AGENDA_SECTION -->`
    })

    // Si aucune section de bibliothèque n'est trouvée, ajoutez-en une nouvelle
    if (!librarySectionPattern.test(content)) {
        newContent += `\n<!-- START_LIBRARY_SECTION -->\n **[${newLibrary.name}](${newLibrary.link})**: ${newLibrary.description}\n<!-- END_LIBRARY_SECTION -->`
    }

    // Si aucune section d'agenda n'est trouvée, ajoutez-en une nouvelle
    if (!agendaSectionPattern.test(content)) {
        newContent += `\n<!-- START_AGENDA_SECTION -->\n${newAgendaContent}\n<!-- END_AGENDA_SECTION -->`
    }

    // Écrire le nouveau contenu dans le README
    fs.writeFileSync(readmePath, newContent, 'utf8')
}

const testDate = formatDate(new Date())
console.log('Date actuelle formatée:', testDate)

const dayAgenda = generateDayAgenda(testDate)
console.log('Contenu de l’agenda pour aujourd’hui:\n', dayAgenda)

// Exécuter la fonction de mise à jour
updateReadme()
