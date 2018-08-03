const Serlina = require('../..')
const path = require('path')

const http = require('http')

const serlina = new Serlina({
  baseDir: path.resolve(__dirname, './')
})

serlina.prepare()
  .then(() => {
    http.createServer(async (req, res) => {
      serlina.inject({ req })

      try {
        const rendered = await serlina.render('page2')

        res.writeHead(200, {
          'Content-Type': 'text/html'
        })
        res.write(rendered.string)
        res.end()
      } catch (e) {
        res.writeHead(200, {
          'Content-Type': 'text/html'
        })
        console.log(e)
        res.write(JSON.stringify(e))
        res.end()
      }

    }).listen(8090)


  })
  .catch(console.error)