# edsa

> Web-based and multi-devices e-book reader.

*[Version française par ici](README.fr.md)*

## Objectives

The goal of this project is to provide a very capable and nice front-end only
web-based ebook reader that can be embeded in a more complete ebook solution.

## Usage

Grab a copy of the `dist` folder which contains all required assets.

Modify `dist/index.html` to suits your needs (ex. include your own text).

Instructions are not yet fully translated to english, we suggest you have
a look at the demo and the text HTML format in `index.html`.

## Development

If you want to modify EDSA or contribute to new feature, please read these steps first.

Your need [NodeJS][nodejs] for development server and Ruby [SASS][sass] for CSS.

The development server will watch for SASS source changes and regenerate the CSS files.

All sources are located in `src` and you may start the development server
after installating Ruby SASS with `bundle` and NodesJS packages with `npm` :

    gem install bundler # if you do not have bundler yet
    bundle install
    npm install

You may then run & open the development server :

    grunt
    open http://localhost:9002

## Credits & license

EDSA source is released under GNU General Public License Version 3. See [LICENSE](LICENSE) for details.

Project by René Audet, Codicille éditeur, Département des littératures, Université Laval,
Hookt Studios, Heliom and other contributors.

Contributions are welcome, please read [contributing guide](CONTRIBUTING.md) first.

[demo]: http://raw.github.com.everydayimmirror.in/codicille/edsa/master/dist/index.html
[nodejs]: http://nodejs.org
[sass]: http://sass-lang.com/install
