const { Serlina } = require('../../dist')
const path = require('path')

const GLOBAL_PAYLOAD = { foo: 'foo' }
const PAGE1 = 'page1' // don't have style
const PAGE2 = 'page2' // have style

describe('Serlina', () => {

  let app

  beforeAll(async () => {
    app = new Serlina({
      baseDir: path.resolve(__dirname, './fixtures/sample'),
      __testing: true
    })
    await app.prepare()
    app.inject(GLOBAL_PAYLOAD)
  })

  test('snapshot', async () => {
    const rendered = await app.render(PAGE1)
    expect(rendered.string).toMatchSnapshot()
    const rendered2 = await app.render(PAGE2)
    expect(rendered2.string).toMatchSnapshot()
  })

  test('inject', async () => {
    const payload = {
      bar: 'bar'
    }
    const rendered = await app.render(PAGE1,payload)
    expect(rendered.__injected).toEqual(Object.assign({},GLOBAL_PAYLOAD, payload))
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

  test('render a non exist page', async () => {
    const rendered = await app.render('non-exist')

    expect(rendered.__pageScripts).toEqual([
      '_404.js',
      '_SERLINA_VENDOR.js',
      '_SERLINA_MAIN.js'
    ])
  })
})