const { Serlina } = require('../../dist')
const path = require('path')

const GLOBAL_PAYLOAD = { foo: 'foo' }
const PAGE_NAME = 'page1'

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
    const rendered = await app.render(PAGE_NAME)
    expect(rendered.string).toMatchSnapshot()
  })

  test('inject', async () => {
    const payload = {
      bar: 'bar'
    }
    const rendered = await app.render(PAGE_NAME,payload)
    expect(rendered.__injected).toEqual(Object.assign({},GLOBAL_PAYLOAD, payload))
  })

  test('page assets', async () => {
    const rendered = await app.render(PAGE_NAME)
    expect(rendered.__pageScripts).toEqual([
      { name: PAGE_NAME, url: PAGE_NAME + '.js' },
      { name: 'vendors', url: 'vendors.js' },
      { name: 'main', url: 'main.js' }
    ])

    expect(rendered.__pageStyles).toEqual([
      { name: PAGE_NAME, url: PAGE_NAME + '.css' }
    ])
  })

  test('render a non exist page', async () => {
    const rendered = await app.render('non-exist')

    expect(rendered.__pageScripts).toEqual([
      { name: '_404', url: '_404' + '.js' },
      { name: 'vendors', url: 'vendors.js' },
      { name: 'main', url: 'main.js' }
    ])

    expect(rendered.__pageStyles).toEqual([
      { name: '_404', url: '_404' + '.css' }
    ])
  })
})