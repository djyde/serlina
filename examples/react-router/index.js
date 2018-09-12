const Koa = require('koa')
const {Serlina} = require('serlina')
const path = require('path')
const Router = require('koa-router')

const serlina = new Serlina({
  baseDir: path.resolve(__dirname)
})

serlina.prepare().then(() => {
  const app = new Koa()
  const router = new Router()

  router.get('/home*', async (ctx) => {
    ctx.body = (await serlina.render('home', { ctx })).body
  })

  app.use(router.routes())

  app.listen(3001, () => {
    console.log('listen on 3001')
  })
})