![logo](https://cdn.nlark.com/yuque/0/2018/png/84329/1533482375370-fc24dd8f-9cf5-46bd-b8ca-8b7cdf43be83.png)

[![npm](https://badgen.net/npm/v/serlina)](https://npm.im/serlina)
[![downloads](https://badgen.net/npm/dm/serlina)](https://npm.im/serlina)
[![CircleCI](https://circleci.com/gh/djyde/serlina.svg?style=shield)](https://circleci.com/gh/djyde/serlina)

A progressive React serverside-rendering framework.

## Motivation

I love using [Next.js](https://github.com/zeit/next.js/), but most of my projects need to use our own web server framework while Next.js run it own server. So I begin making a SSR framework (core) that like Next.js but open for server implementation. It does all the building, compiling, rendering-to-string things and give the rest render-to-html things to your own web server.

> Of course I know Next.js can [custom server and routing](https://github.com/zeit/next.js#custom-server-and-routing), but while Next.js handle the whole http `context`, [I cannot use it in a high layer web framework](https://github.com/eggjs/egg/issues/328).

[Read the announcing post](https://medium.com/@djyde/serlina-a-progressive-react-serverside-rendering-framework-a4de2d71d984)

## Integrations

- Egg: [egg-serlina](https://github.com/serlina-community/egg-serlina)

## Quick Start

```
npm i serlina react react-dom --save
```

Create a folder structure like:

```bash
├── index.js
├── page
│   └── page1.js
```

```js
// page/page1.js

export default () => {
  return <div>Hello Serlina!</div>
}
```

And implement a most simple http server:

```js
// index.js

const { Serlina } = require('serlina')
const path = require('path')

const http = require('http')

const serlina = new Serlina({
  baseDir: path.resolve(__dirname, './')
})

serlina.prepare()
  .then(() => {
    http.createServer(async (req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        if (req.url === '/page1') {
          const rendered = await serlina.render('page1')
          res.write(rendered.string)
        } else {
          res.write('works!')
        }
        res.end()
    }).listen(8090)
  })
  .catch(console.error)
```

Open `http://localhost:8090/page1`, you will see the page you wrote in React!

## Advanced

### Initial Props

In many scenarios, we need to give the page some initial props. You can do it just like Next.js' `static getInitialProps(): object`. But a few different in Serlina:

You need to use `serlina.inject` to inject some payload to the `getInitialProps` function:

```diff
serlina.prepare()
  .then(() => {
    http.createServer(async (req, res) => {
+       // we inject a object that contains `req` here:
+       serlina.inject({ req })
        res.writeHead(200, { 'Content-Type': 'text/html' })
        if (req.url === '/page1') {
          const rendered = await serlina.render('page1')
          res.write(rendered.string)
        } else {
          res.write('works!')
        }
        res.end()
    }).listen(8090)
  })
```

Then you can get it in `getInitialProps`:

```js
// page/page1.js
import * as React from 'react'

export default class Page1 extends React.Component {

  static async getInitialProps ({ req }) {
    return {
      url: req.url
    }
  }

  render () {
    return <div>You are now at {this.props.url}</div>
  }
}

```

Otherwise, you could inject the payload when calling `serlina.render`:

```js
const rendered = await serlina.render('page1', { ctx: 'some context' })
```

### Styles

#### plain css

Serlina support plain css, just import it:

```js
// page/page1.js
import './style/foo.css'

export default () => {
  return <div>Hello Serlina!</div>
}
```

#### custom css processer

While you are able to [Customize Webpack config](#custom-webpack-config), you can add whatever css processer loader you want. For example, when we need `less-loader`:

```
npm i less less-loader --save-dev
```

In `serlina.config.js`:

```js
// serlina.config.js
module.exports = {
  webpack(webpack, { miniCSSLoader }) {
    return {
      module: {
        rules: [{
          test: /\.less$/,
          use: [ miniCSSLoader, 'css-loader', 'less-loader']
        }]
      }
    }
  }
}
```

<p class="warning">Notice that you should use `miniCSSLoader` instead of `style-loader`.</p>

### Custom Webpack config

It's easy to customize Webpack plugin. Create a `serlina.config.js`:

```js
// serlina.config.js

module.exports = {
  webpack(webpack, options) {
    return {
      module: {
        rules: [{
         // ...
        }]
      }
    }
  }
}
```

The configuration you return will merged to the default configuration using [`wepback-merge`](https://github.com/survivejs/webpack-merge#mergesmartconfiguration-configuration)

#### options

`options` is an object that contains:

- `dev` **boolean**. dev mode.
- `miniCSSLoader` Actually the `MiniCssExtractPlugin.loader`. Use in place of `style-loader`
- `baseDir` **string** Serlina application baseDir
- `merge` The [merge.smart](https://github.com/survivejs/webpack-merge#mergesmartconfiguration-configuration) function.


### Custom Babel config

All you need to do is adding a `.babelrc` in `baseDir`.

### Custom 404 page

If the page that render by `serlina.render()` is not exist, Serlina will render a default 404 page. You can use wirte own 404 page by creating a `_404` file in `page` folder:

```js
// page/_404.js

export default () => {
  return <div>Page not found</div>
}
```

### Custom `<head>`

```js
// page/page1.js

import * as Reat from 'react'
import Head from 'serlina/head'

export default () => {
  return (
    <div>
      <Head>
        <title>Page1</title>
      </Head>

      <div>page1 content...</div>
    </div>
  )
}
```

### Production deployment

To deploy your Serlina application, you need to run a build command:

```
serlina build <baseDir>
```

For example, imagin you have a structure:

```bash
- index.js
- page
  - page1.js
- package.json
```

After `serlina build .`, a `.serlina` folder will generate. You should serve it with your web server, or upload to CDN.

Let's say your web server serve static files in `/public` route:

```js
// index.js
const app = new Serlina({
  dev: false, // turn dev mode to false
  publicPath: '/public/'
})
```

```json
// package.json
{
  "scripts": {
    "start": "node server",
    "build": "serlina build . --publicPath /public/"
  }
}
```
