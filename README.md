Simple wrapper around html5 video player

## Table of contents

1. [Installation](#installation)
2. [Demo](#demo)
3. [Usage](#usage)
4. [Building](#building)
5. [Authors](#authors)
6. [Contribute](#contribute)
7. [License](#license)

## Installation
### yarn / npm

```sh
yarn add seng-video-element
```

```sh
npm i -S seng-video-element
```

## Online Demo
Checkout the online [demo](https://riccoarntz.github.io/video-element/example/).


## Demo
Demo can be found in /example.
Install dev dependencies:
```sh
  yarn
```
Run the example:
```sh
  yarn dev
```

## Usage
Detailed documentation and examples are located in the wiki!

### [Check the wiki!](https://github.com/riccoarntz/video-element/wiki)


## Building

In order to build seng-video-element, ensure that you have [Git](http://git-scm.com/downloads) and [Node.js]
(http://nodejs.org/) installed.

Clone a copy of the repo:
```sh
git clone https://github.com/riccoarntz/video-element.git
```

Change to the vue-transition directory:
```sh
cd seng-video-element
```

Install dev dependencies:
```sh
yarn
```

Use one of the following main scripts:
```sh
yarn build           # build this project
yarn dev             # run dev-watch mode, serving example/index.html in the browser
yarn generate        # generate all artifacts (compiles ts, webpack, docs and coverage)
yarn test:unit       # run the unit tests
yarn validate        # runs validation scripts, including test, lint and coverage check
yarn lint            # run tslint on this project
yarn doc             # generate typedoc documentation
```

When installing this module, it adds a pre-push hook, that runs the `validate`
script before committing, so you can be sure that everything checks out.


## Authors
View [AUTHORS.md](./AUTHORS.md)

## Contribute
View [CONTRIBUTING.md](./CONTRIBUTING.md)

## License
[MIT](./LICENSE) © Ricco Arntz
