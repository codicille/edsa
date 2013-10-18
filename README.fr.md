# edsa

> Liseuse numérique multiplateforme et entièrement web.

## Objectifs

Le but de ce projet est de produire une liseuse numérique entièrement web
et seulement front-end, qui peut être utilisé dans une solution plus
complète de lecture en ligne.

Le projet est exécuté via le cadre d'application web ruby [Sinatra][sinatra]
pour le démo, mais l'idée est de pouvoir utiliser le code dans n'importe quel
langage ou cadre d'application.

## Guide de démarrage

Minimum requis pour exécuter l'application de démo :

* Ruby 1.9.3+

Exécutez `script/setup` pour installer le projet.

Utilisez `foreman start` pour exécuter l'application.

## Principes

La liseuse permet de charger un texte balisé de façon à le rendre aisément
lisible dans un navigateur web. Le balisage permet d’intégrer les métadonnées
de base du texte et d’établir le formatage du texte (sections, chapitres,
paragraphes, table des matières). L’interface génère la table des matières du
texte et numérote les paragraphes pour référencement ultérieur. Elle offre
également des options d’affichage à l’écran (mise en page, typographie) ainsi
que des modes de navigation simples.

## Balisage des textes

À titre d'exemple, voir le contenu du fichier `app/views/index.erb`.

### Identification de l'ouvrage

Nous suggérons que le fichier débute par l'identification de l'auteur et du titre
de l'ouvrage.

La classe `author` sert à identifier le nom de l'auteur.

La classe `title` sert à identifier le titre de l'ouvrage.

Ces classes serviront notamment à bâtir le titre de la fenêtre, ainsi que l'entête
se trouvant dans le panneau de réglages.

````html
<h1 class="author">Lorem Nelson</h1>
<h2 class="title">Deserunt non delectus</h2>
````

L'utilisation des balises d'entêtes `<h1>` et `<h2>` n'est pas obligatoire, mais
recommandée.

### Balises réservées

Un certain nombre de balises HTML standards sont utilisées par l'application
pour identifier différentes parties de l'ouvrage. Assurez-vous de les utiliser
tel que décrit ci-dessous.

#### Paragraphes et numérotation

La balise `<p>` est utilisée pour identifier les paragraphes à travers le texte. La numérotation est
générée automatiquement à partir de leur ordre.

La classe `paragraph` permet d'inclure d'autres types de balises HTML (`blockquote`, `ul`, etc.)
à la numérotation.

La classe `exclude` permet d'exclure un paragraphe de la numérotation.

```html
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
<p>Quisque sed lectus orci. Sed vel venenatis nisl.</p>
<blockquote>Aliquam ornare sem est, eu sodales.</blockquote>
<ul class="paragraph">
  <li>Proin varius placerat lacus</li>
  <li>Curabitur nisl nulla</li>
</ul>
<p class="exclude">Aliquam pretium.</p>
```

Dans l'exemple ci-dessus, **trois** éléments seront tenus en compte dans la numérotation:
les deux premières balises `<p>`, ainsi que la balise `<ul>` ayant la classe `paragraph`.

#### Sections et chapitres

`<section>` permet d'identifier les différentes parties de l'ouvrage, en combinaison
avec les classes suivantes:

- `lim` identifie toutes les parties liminaires de l'ouvrage (préface, avant-propos, etc.)
- `chapter` identifie un chapitre

Les `<section>` serviront également à bâtir la table des matières. Il est donc
obligatoire pour chaque section d'avoir son propre titre ou identifiant. La balise
`<h3>` est utilisée à cette fin.

**Exemple: préface suivie du premier chapitre**

````html
<section class="lim">
  <h3>Préface</h3>
  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
  <p>Sed, voluptatem numquam error. Optio, quae ad iusto recusandae accusantium cumque.</p>
</section>

<section class="chapter">
  <h3>Lorem ipsum</h3>
  <p>Atque, quia consectetur quisquam libero numquam velit ducimus amet laboriosam!</p>
  <p>Facilis, ipsa eum dolorem voluptatem adipisci perspiciatis nemo est cum eos quisquam?</p>
</section>

````

Ces classes serviront notamment à mettre à jour l'URL lors de la consultation de l'ouvrage.
Ex. : `www.domaine.com/lim/1` pour la première partie liminaire ou `www.domaine.com/chap/16`
pour le chapitre 16.

## Crédits & licence

Le code source de EDSA est disponible sous la licence GNU General Public License Version 3.
Consultez [LICENSE](LICENSE) pour les détails. La licence est disponible uniquement en anglais
puisqu'il serait complexe et coûteux de fournir une traduction officielle cette licence.
Vous pouvez toutefois trouvez des traductions approximatives n'ayant pas valeur légale sur
[GNU](http://www.gnu.org/licenses/translations.html)

Le project est une réalisation conjointe de de René Audet, Codicille éditeur,
Département des littératures, Université Laval, Hookt Studios, Heliom
et tous les autres contributeurs.

Les contributions sont bienvenues, veuillez toutefois d'abord consulter le [guide de contribution](CONTRIBUTING.md).

[sinatra]: https://github.com/sinatra
