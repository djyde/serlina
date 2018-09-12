const {
  Serlina
} = require('../../dist')
const path = require('path')

const GLOBAL_PAYLOAD = {
  foo: 'foo'
}
const PAGE1 = 'page1' // don't have style
const PAGE2 = 'page2' // have style

const PUBLIC_PATH = '/public/'
const BASE_DIR = path.resolve(__dirname, './fixtures/sample')

describe('Serlina', () => {

  describe('dev mode', () => {

    let app

    beforeAll(async () => {
      app = new Serlina({
        baseDir: BASE_DIR,
        __testing: true
      })
      await app.prepare()
      app.inject(GLOBAL_PAYLOAD)
    })

    test('snapshot', async () => {
      const rendered = await app.render(PAGE1)
      expect(rendered.body).toMatchSnapshot()
      const rendered2 = await app.render(PAGE2)
      expect(rendered2.body).toMatchSnapshot()
    })

    test('inject', async () => {
      const payload = {
        bar: 'bar'
      }
      const rendered = await app.render(PAGE1, payload)
      expect(rendered.__injected).toEqual(Object.assign({}, GLOBAL_PAYLOAD, payload))
    })

    test('page assets', async () => {
      const rendered = await app.render(PAGE1)
      expect(rendered.__pageScripts).toEqual([
        PAGE1 + '.js',
        '_SERLINA_VENDOR.js',
        '_SERLINA_MAIN.js'
      ])

      expect(rendered.__pageStyles).toEqual([])
    })

    test('page assets (have style)', async () => {
      const rendered = await app.render(PAGE2)
      expect(rendered.__pageScripts).toEqual([
        PAGE2 + '.js',
        '_SERLINA_VENDOR.js',
        '_SERLINA_MAIN.js'
      ])

      expect(rendered.__pageStyles).toEqual([
        PAGE2 + '.css'
      ])
    })

    test('get initial props', async () => {
      const rendered = await app.render(PAGE2)
      expect(rendered.__initialProps).toEqual({
        foo: 'foo'
      })
    })

    test('render a non exist page', async () => {
      const rendered = await app.render('non-exist')

      expect(rendered.__pageScripts).toEqual([
        '_404.js',
        '_SERLINA_VENDOR.js',
        '_SERLINA_MAIN.js'
      ])
    })

    test('nested page', async () => {
      const rendered = await app.render('user/list')
      expect(rendered.body).toMatchSnapshot()
    })
  })

  describe('prod mode', () => {

    let app;
    let assetsMap;

    beforeAll(() => {
      app = new Serlina({
        baseDir: BASE_DIR,
        dev: false,
        publicPath: PUBLIC_PATH,
        __testing: true
      })
      app.inject(GLOBAL_PAYLOAD)
      return new Promise((res, rej) => {
        const compiler = app.build()
        compiler.run((err, stats) => {
          if (err || stats.hasErrors()) {
            rej(err || stats.toJson())
          } else {
            assetsMap = require(path.resolve(BASE_DIR, './.serlina/assetsmap.json'))
            app.prepare().then(res(stats.toJson())).catch(rej)
          }
        })
      })
    }, 20000)

    test('page assets', async () => {
      const rendered = await app.render(PAGE1)
      expect(rendered.__pageScripts).toEqual([
        assetsMap[PAGE1].js,
        assetsMap['_SERLINA_VENDOR'].js,
        assetsMap['_SERLINA_MAIN'].js
      ])

      expect(rendered.__pageStyles).toEqual([])
    })

    test('page assets (have style)', async () => {
      const rendered = await app.render(PAGE2)
      expect(rendered.__pageScripts).toEqual([
        assetsMap[PAGE2].js,
        assetsMap['_SERLINA_VENDOR'].js,
        assetsMap['_SERLINA_MAIN'].js
      ])

      expect(rendered.__pageStyles).toEqual([
        assetsMap[PAGE2].css
      ])
    })

    test('render a non exist page', async () => {
      const rendered = await app.render('non-exist')

      expect(rendered.__pageScripts).toEqual([
        assetsMap['_SERLINA_VENDOR'].js,
        assetsMap['_SERLINA_MAIN'].js
      ])
    })

    test('nested page', async () => {
      const rendered = await app.render('user/list')
      expect(rendered.body)
    })

  })

  describe('test config', () => {

    test('webpack config', async () => {

      const app = new Serlina({
        baseDir: BASE_DIR,
        __testing: true
      })
      await app.prepare()
      app.inject(GLOBAL_PAYLOAD)

      const [serverSide, clientSide, vendors] = app._webpackConfig

      // TODO: webpack config test
      expect(serverSide)
      expect(clientSide)
      expect(vendors)      
    })

  })
})