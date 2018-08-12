# serlina-koa

[![npm](https://badgen.net/npm/v/serlina-koa)](https://npm.im/serlina-koa)
[![downloads](https://badgen.net/npm/dm/serlina-koa)](https://npm.im/serlina-koa)

🚨 [WIP]

Serlina binding for Koa

## Usage

```
npm react react-dom serlina-koa --save
```

```js
// your-server.js

const Koa = require('koa')
const {Serlina} = require('serlina')
const path = require('path')

// init Serlina
const serlina = new Serlina({
  baseDir: path.resolve(__dirname, './')
})

const serlinaKoa = require('../')

const app = new Koa()

serlina.prepare().then(() => {

  // map the url
  app.use(serlinaKoa({
    serlina,
    map: {
      '/page1': 'page1'
    }
  }))

  app.listen(3001, () => {
    console.log('Started on http://localhost:3001')
  })
  
})
```

## API

### serlinaKoa(options)

#### options

- **serlina** Serlina instance
- **map** a map object to map the url that should render Serlina page

# License

MIT License
