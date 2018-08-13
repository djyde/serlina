const Serve = require('../')
const path = require('path')
const supertest = require('supertest')

describe('serlina-serve', () => {
  let request


  beforeAll(() => {
    return new Promise((res, rej) => {
      const serve = new Serve({
        baseDir: path.resolve(__dirname, './fixtures'),
        __testing: true
      })

      serve.serlina.prepare().then(() => {
        const server = serve.app.listen(3001, () => {
          request = supertest(server)
  
          res()
        })
      })     
    })
  })

  test('render page', async () => {
    const res = await request.get('/page1')

    expect(res.text.startsWith('<!DOCTYPE html>')).toBeTruthy()
  })
})