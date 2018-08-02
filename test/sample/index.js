const Celina = require('../..')
const path = require('path')

const Koa = require('koa')
const serve = require('koa-static')

const staticPath = path.resolve(__dirname, './public')

const celina = new Celina({
  baseDir: path.resolve(__dirname, './'),
  outputPath: staticPath
})

celina.prepare()
  .then(() => {
    const rendered = celina.render('page1')

    const app = new Koa()

    app.use(serve(staticPath))

    app.use(async ctx => {
      ctx.body = rendered.string
    })

    app.listen(8080)
  })
  .catch(console.error)