const Serlina = require('../..')
const path = require('path')

const Koa = require('koa')
const serve = require('koa-static')

const staticPath = path.resolve(__dirname, './public')

const serlina = new Serlina({
  baseDir: path.resolve(__dirname, './'),
  outputPath: staticPath
})

serlina.prepare()
  .then(() => {
    const rendered = serlina.render('page1')

    const app = new Koa()

    app.use(serve(staticPath))

    app.use(async ctx => {
      ctx.body = rendered.string
    })

    app.listen(8080)
  })
  .catch(console.error)