const Koa = require('koa')
const { Serlina } = require('serlina')
const serlinaKoa = require('serlina-koa')
const path = require('path')
const fs = require('fs')

class Serve {

  constructor(options) {

    const app = new Koa()

    const serlina = new Serlina(options)

    const {
      baseDir
    } = options

    const map = {}

    fs.readdirSync(path.resolve(baseDir, './page')).map(filename => filename.split('.')[0]).forEach(page => {
      map['/' + page] = page
    })

    app.use(serlinaKoa({
      serlina,
      map
    }))

    this.serlina = serlina
    this.app = app
  }
}

module.exports = Serve
