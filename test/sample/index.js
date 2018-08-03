const Serlina = require('../..')
const path = require('path')

const http = require('http')

const staticPath = path.resolve(__dirname, './public')

const serlina = new Serlina({
  baseDir: path.resolve(__dirname, './'),
  outputPath: staticPath
})

serlina.prepare()
  .then(() => {
    const rendered = serlina.render('page1')

    http.createServer((req, res) => {
      res.writeHead(200, {'Content-Type': 'text/html'})
      res.write(rendered.string)
      res.end()
    }).listen(8090)


  })
  .catch(console.error)