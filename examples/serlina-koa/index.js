const Koa = require('koa')
const {Serlina} = require('serlina')
const path = require('path')

// init Serlina
const serlina = new Serlina({
  baseDir: path.resolve(__dirname, './')
})

const serlinaKoa = require('serlina-koa')

const app = new Koa()

serlina.prepare().then(() => {

  // map the url
  app.use(serlinaKoa({
    serlina,
    mapAll: true
  }))

  app.listen(3001, () => {
    console.log('Started on http://localhost:3001')
  })
  
})